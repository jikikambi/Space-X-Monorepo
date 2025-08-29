import { Router } from "express";
import { rabbitMQ } from "../mq";

const router = Router();

/**
 * GET /rabbitmq/health
 * Returns full buffer health for monitoring
 */
router.get("/health", (_req, res) => {
  const { bufferedEvents, timeSinceFirstBufferedMs, lastPublishAttempt, isConnected } = rabbitMQ.getBufferHealth();

  res.json({
    bufferedEvents,
    timeSinceFirstBufferedMs,
    lastPublishAttempt,
    isConnected,
    message:
      bufferedEvents > 0
        ? `${bufferedEvents} events waiting to be published, oldest is ${timeSinceFirstBufferedMs}ms old`
        : "No buffered events",
  });
});

export default router;
