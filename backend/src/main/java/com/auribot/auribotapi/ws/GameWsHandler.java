package com.auribot.auribotapi.ws;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class GameWsHandler extends TextWebSocketHandler {

	private final ObjectMapper mapper = new ObjectMapper();

	private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
	private final Map<String, PlayerState> players = new ConcurrentHashMap<>();
	// public player id -> session id
	private final ConcurrentMap<String, String> sessionIdByPublicId = new ConcurrentHashMap<>();

	// Rock-Paper-Scissors matches, keyed by sorted pair "idA|idB"
	private final ConcurrentMap<String, RpsMatch> rpsMatches = new ConcurrentHashMap<>();
	// basic anti-spam per pair
	private final ConcurrentMap<String, Long> lastRpsAtByPair = new ConcurrentHashMap<>();
	private static final long RPS_PAIR_COOLDOWN_MS = 2500;

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		sessions.put(session.getId(), session);
		// Wait for a "join" message to create a player.
		send(session, mapper.createObjectNode()
				.put("type", "hello")
				.put("sessionId", session.getId()));
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		JsonNode root;
		try {
			root = mapper.readTree(message.getPayload());
		} catch (IOException e) {
			return;
		}

		String type = root.path("type").asText("");
		switch (type) {
			case "join" -> handleJoin(session, root);
			case "move" -> handleMove(session, root);
			case "rps_challenge" -> handleRpsChallenge(session, root);
			case "rps_choice" -> handleRpsChoice(session, root);
			case "ping" -> send(session, mapper.createObjectNode().put("type", "pong"));
			default -> {
				// ignore
			}
		}
	}

	private void handleJoin(WebSocketSession session, JsonNode root) throws IOException {
		String name = root.path("name").asText("Player").trim();
		if (name.isBlank()) name = "Player";
		if (name.length() > 32) name = name.substring(0, 32);

		// Give a stable public id per connection
		String publicId = UUID.randomUUID().toString();
		double x = root.path("x").asDouble(200);
		double y = root.path("y").asDouble(200);

		PlayerState me = new PlayerState(publicId, name, x, y);
		players.put(session.getId(), me);
		sessionIdByPublicId.put(me.id(), session.getId());

		// Tell the joiner their own public id (so the client can avoid rendering itself twice)
		send(session, mapper.createObjectNode()
				.put("type", "you")
				.put("id", me.id()));

		// Send snapshot to the joiner
		var snapshot = mapper.createObjectNode();
		snapshot.put("type", "snapshot");
		var arr = snapshot.putArray("players");
		for (PlayerState p : players.values()) {
			arr.add(mapper.createObjectNode()
					.put("id", p.id())
					.put("name", p.name())
					.put("x", p.x())
					.put("y", p.y()));
		}
		send(session, snapshot);

		// Broadcast join
		broadcast(mapper.createObjectNode()
				.put("type", "join")
				.put("id", me.id())
				.put("name", me.name())
				.put("x", me.x())
				.put("y", me.y()));
	}

	private void handleMove(WebSocketSession session, JsonNode root) throws IOException {
		PlayerState cur = players.get(session.getId());
		if (cur == null) return; // must join first

		double x = root.path("x").asDouble(cur.x());
		double y = root.path("y").asDouble(cur.y());

		PlayerState updated = new PlayerState(cur.id(), cur.name(), x, y);
		players.put(session.getId(), updated);

		broadcast(mapper.createObjectNode()
				.put("type", "pos")
				.put("id", updated.id())
				.put("x", updated.x())
				.put("y", updated.y()));
	}

	private void handleRpsChallenge(WebSocketSession session, JsonNode root) throws IOException {
		PlayerState me = players.get(session.getId());
		if (me == null) return;

		String targetId = root.path("targetId").asText("");
		if (targetId.isBlank() || targetId.equals(me.id())) return;

		String targetSessionId = sessionIdByPublicId.get(targetId);
		if (targetSessionId == null) return;
		WebSocketSession targetSession = sessions.get(targetSessionId);
		if (targetSession == null || !targetSession.isOpen()) return;

		String matchId = pairKey(me.id(), targetId);
		long now = System.currentTimeMillis();
		Long last = lastRpsAtByPair.get(matchId);
		if (last != null && (now - last) < RPS_PAIR_COOLDOWN_MS) return;
		lastRpsAtByPair.put(matchId, now);

		// Create match if absent
		RpsMatch created = new RpsMatch(matchId, minId(me.id(), targetId), maxId(me.id(), targetId));
		RpsMatch existing = rpsMatches.putIfAbsent(matchId, created);
		if (existing != null) return; // already active

		// Notify both players to start RPS
		var start = mapper.createObjectNode();
		start.put("type", "rps_start");
		start.put("matchId", matchId);
		start.put("a", created.a());
		start.put("b", created.b());

		send(session, start);
		send(targetSession, start);
	}

	private void handleRpsChoice(WebSocketSession session, JsonNode root) throws IOException {
		PlayerState me = players.get(session.getId());
		if (me == null) return;

		String matchId = root.path("matchId").asText("");
		String choice = root.path("choice").asText("").toLowerCase();
		if (matchId.isBlank()) return;
		if (!(choice.equals("rock") || choice.equals("paper") || choice.equals("scissors"))) return;

		RpsMatch match = rpsMatches.get(matchId);
		if (match == null) return;
		if (!me.id().equals(match.a()) && !me.id().equals(match.b())) return;

		// Record choice
		RpsMatch updated;
		if (me.id().equals(match.a())) updated = match.withAChoice(choice);
		else updated = match.withBChoice(choice);
		rpsMatches.put(matchId, updated);

		// If both choices present -> compute result, broadcast, remove
		if (updated.aChoice() == null || updated.bChoice() == null) return;

		String winnerId = computeWinner(updated.a(), updated.aChoice(), updated.b(), updated.bChoice());

		var result = mapper.createObjectNode();
		result.put("type", "rps_result");
		result.put("matchId", matchId);
		result.put("a", updated.a());
		result.put("b", updated.b());
		result.put("aChoice", updated.aChoice());
		result.put("bChoice", updated.bChoice());
		result.put("winnerId", winnerId); // "draw" or player id

		WebSocketSession aSess = sessionForPublicId(updated.a());
		WebSocketSession bSess = sessionForPublicId(updated.b());
		if (aSess != null) send(aSess, result);
		if (bSess != null) send(bSess, result);

		rpsMatches.remove(matchId);
	}

	private WebSocketSession sessionForPublicId(String publicId) {
		String sid = sessionIdByPublicId.get(publicId);
		if (sid == null) return null;
		WebSocketSession s = sessions.get(sid);
		if (s == null || !s.isOpen()) return null;
		return s;
	}

	private static String pairKey(String id1, String id2) {
		return minId(id1, id2) + "|" + maxId(id1, id2);
	}

	private static String minId(String a, String b) {
		return a.compareTo(b) <= 0 ? a : b;
	}

	private static String maxId(String a, String b) {
		return a.compareTo(b) <= 0 ? b : a;
	}

	private static String computeWinner(String aId, String aChoice, String bId, String bChoice) {
		if (aChoice.equals(bChoice)) return "draw";
		boolean aWins = (aChoice.equals("rock") && bChoice.equals("scissors"))
				|| (aChoice.equals("paper") && bChoice.equals("rock"))
				|| (aChoice.equals("scissors") && bChoice.equals("paper"));
		return aWins ? aId : bId;
	}

	private record RpsMatch(String matchId, String a, String b, String aChoice, String bChoice) {
		RpsMatch(String matchId, String a, String b) {
			this(matchId, a, b, null, null);
		}

		RpsMatch withAChoice(String c) {
			return new RpsMatch(matchId, a, b, c, bChoice);
		}

		RpsMatch withBChoice(String c) {
			return new RpsMatch(matchId, a, b, aChoice, c);
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		sessions.remove(session.getId());
		PlayerState removed = players.remove(session.getId());
		if (removed != null) {
			sessionIdByPublicId.remove(removed.id());
			broadcast(mapper.createObjectNode()
					.put("type", "leave")
					.put("id", removed.id()));
		}
	}

	private void broadcast(JsonNode msg) {
		String payload;
		try {
			payload = mapper.writeValueAsString(msg);
		} catch (JsonProcessingException e) {
			return;
		}
		TextMessage tm = new TextMessage(payload);
		for (WebSocketSession s : sessions.values()) {
			try {
				if (s.isOpen()) s.sendMessage(tm);
			} catch (IOException ignored) {
			}
		}
	}

	private void send(WebSocketSession session, JsonNode msg) throws IOException {
		try {
			session.sendMessage(new TextMessage(mapper.writeValueAsString(msg)));
		} catch (JsonProcessingException e) {
			// ignore
		}
	}
}
