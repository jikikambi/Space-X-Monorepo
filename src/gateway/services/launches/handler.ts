import { logger } from "@space-x/shared/logger";
import { enrichLaunchWithCache } from "./enrich";
import { rabbitMQ } from "src/gateway/mq";
import { broadcastEvent } from "src/gateway/sse/sseManager";
import { SpaceXEvent } from "src/gateway/types/types";

/**
 * Handle incoming SpaceXEvent objects.
 */
export async function handleEvent(event: SpaceXEvent) {
  if (!event?.event || !event.payload) {
    logger.warn("[Gateway] Skipped invalid event payload");
    return;
  }

  switch (event.event) {
    case "ENRICH_LAUNCH": {
      const enrichedPayload = await enrichLaunchWithCache(event.payload);

      // Publish enriched launch
      await rabbitMQ.publishEvent({ ...event, payload: enrichedPayload });
      logger.info(`[Gateway] Published enriched launch: ${enrichedPayload.launch.id}`);

      // Broadcast to SSE
      broadcastEvent({ ...event, payload: enrichedPayload });
      break;
    }

    default:
      await rabbitMQ.publishEvent(event);
      logger.info(`[Gateway] Published event: ${event.event}`);
  }
}
