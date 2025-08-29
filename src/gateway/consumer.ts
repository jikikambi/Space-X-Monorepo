import { Channel } from "amqplib";
import { logger } from "@space-x/shared/logger";
import { broadcastEvent } from "./sse";
import { SpaceXEvent, EnrichedLaunchPayload } from "./types/types";

const QUEUE_NAME = "spacex.events";

// Type guard to ensure payload has the correct structure for ENRICH_LAUNCH
function isEnrichLaunchEvent(event: SpaceXEvent): event is SpaceXEvent & { payload: EnrichedLaunchPayload } {
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

export async function startConsumer(channel: Channel) {
  await channel.consume(QUEUE_NAME, (msg) => {
    if (!msg) return;

    try {
      const event: SpaceXEvent = JSON.parse(msg.content.toString());

      switch (event.event) {
        case "ENRICH_LAUNCH":
          const payload = (event as any).payload; // capture for logging

          if (isEnrichLaunchEvent(event)) {
            const { launch, rocket, payloads, ships } = event.payload;

            logger.info(`[Consumer] Enriched launch received: ${launch.id}`);

            broadcastEvent({
              event: "ENRICH_LAUNCH",
              payload: { launch, rocket, payloads, ships },
            });
          } else {
            logger.error("[Consumer] Invalid ENRICH_LAUNCH payload:", payload);
          }
          break;

        default:
          // Forward other events
          logger.info(`[Consumer] Forwarding event: ${event.event}`);
          broadcastEvent(event);
          break;
      }

      channel.ack(msg);
    } catch (err) {
      logger.error("[Consumer] Failed to process event:", err);
      // Avoid poison messages blocking the queue
      channel.nack(msg, false, false);
    }
  });

  logger.info("[Consumer] RabbitMQ consumer started");
}