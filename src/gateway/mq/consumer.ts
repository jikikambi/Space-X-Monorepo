import { Channel } from "amqplib";
import { logger } from "@space-x/shared/logger";
import { EnrichedLaunchPayload, SpaceXEvent } from "../types/types";
import { broadcastEvent } from "../sse";

const QUEUE_NAME = "spacex.events";

/**
 * Type guard for ENRICH_LAUNCH events
 */
function isEnrichLaunchEvent(event: SpaceXEvent): event is {
  event: "ENRICH_LAUNCH";
  payload: EnrichedLaunchPayload;
} {
  return (
    event.event === "ENRICH_LAUNCH" &&
    typeof event.payload === "object" &&
    event.payload !== null &&
    "launch" in event.payload &&
    "rocket" in event.payload &&
    "payloads" in event.payload &&
    "ships" in event.payload
  );
}

/**
 * Start a RabbitMQ consumer for SpaceX events
 */
export async function startConsumer(channel: Channel) {
  await channel.consume(QUEUE_NAME, (msg) => {
    if (!msg) return;

    try {
      const event: SpaceXEvent = JSON.parse(msg.content.toString());

      if (isEnrichLaunchEvent(event)) {
        // ENRICH_LAUNCH event: fully typed
        logger.info(`[Consumer] Enriched launch received: ${event.payload.launch.id}`);
        broadcastEvent(event);
      } else {
        // Other events
        logger.info(`[Consumer] Forwarding event: ${event.event}`);
        broadcastEvent(event);
      }

      // Acknowledge the message
      channel.ack(msg);
    } catch (err) {
      logger.error("[Consumer] Failed to process event:", err);
      // Avoid poison messages blocking the queue
      channel.nack(msg, false, false);
    }
  });

  logger.info("[Consumer] RabbitMQ consumer started");
}