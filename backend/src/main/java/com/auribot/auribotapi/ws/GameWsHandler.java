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

@Component
public class GameWsHandler extends TextWebSocketHandler {

	private final ObjectMapper mapper = new ObjectMapper();

	private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
	private final Map<String, PlayerState> players = new ConcurrentHashMap<>();

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

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		sessions.remove(session.getId());
		PlayerState removed = players.remove(session.getId());
		if (removed != null) {
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
