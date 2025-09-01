import { Response } from "express";
import { SpaceXEvent } from "../../types/types";
import { logger } from "@space-x/shared/logger";
import { redis } from "../redisClient"; 

const clients: Response[] = [];

/** Register a new SSE client */
export async function registerClient(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.push(res);

  // Send cached events to the new client
  try {
    const keys: string[] = await redis.keys("event:*");
    if (keys.length > 0) {
      const cachedEvents = await redis.mGet(keys);
      cachedEvents.forEach((item) => {
        if (item) res.write(`data: ${item}\n\n`);
      });
    }
  } catch (err: any) {
    logger.error("[SSE] Failed to load cached events for new client", err.message);
  }

  res.on("close", () => {
    const index = clients.indexOf(res);
    if (index !== -1) clients.splice(index, 1);
    logger.info(`[SSE] Client disconnected. Total clients: ${clients.length}`);
  });

  logger.info(`[SSE] Client connected. Total clients: ${clients.length}`);
}

/** Broadcast a SpaceXEvent to all connected SSE clients */
export function broadcastEvent(event: SpaceXEvent) {
  if (clients.length === 0) {
    logger.info(`[SSE] No clients connected. Skipping broadcast: ${event.event}`);
    return;
  }

  const data = `data: ${JSON.stringify(event)}\n\n`;

  clients.forEach((client, index) => {
    try {
      client.write(data);
    } catch (err) {
      logger.error(`[SSE] Failed to write to client #${index}`, err);
    }
  });

  logger.info(`[SSE] Broadcasted event: ${event.event} to ${clients.length} clients`);
}
