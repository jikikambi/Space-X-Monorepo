import { Response } from "express";
import { SpaceXEvent } from "./types/types";

const clients: Response[] = [];

/**
 * Register a new SSE client
 */
export function registerClient(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.push(res);

  res.on("close", () => {
    const index = clients.indexOf(res);
    if (index !== -1) clients.splice(index, 1);
  });

  console.log(`[SSE] Client connected. Total clients: ${clients.length}`);
}

/**
 * Broadcast a SpaceXEvent to all connected SSE clients
 */
export function broadcastEvent(event: SpaceXEvent) {
  const data = `data: ${JSON.stringify(event)}\n\n`;

  clients.forEach((client, index) => {
    try {
      client.write(data);
    } catch (err) {
      console.error(`[SSE] Failed to write to client #${index}`, err);
    }
  });

  console.log(`[SSE] Broadcasted event: ${event.event} to ${clients.length} clients`);
}