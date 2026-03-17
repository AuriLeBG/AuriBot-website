package com.auribot.auribotapi.ws;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class GameSnapshotScheduler {
	private final GameWsHandler handler;

	public GameSnapshotScheduler(GameWsHandler handler) {
		this.handler = handler;
	}

	// Periodic snapshots solve multiple issues:
	// - stale/ghost players if a close event is missed
	// - clients can reconcile consistently
	@Scheduled(fixedDelay = 1500)
	public void tick() {
		handler.cleanupStaleSessions();
		handler.broadcastSnapshot();
	}
}
