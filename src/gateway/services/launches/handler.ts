import { logger } from "@space-x/shared/logger";
import { enrichLaunchWithCache } from "./enrich";
import { rabbitMQ } from "src/gateway/mq";
import { broadcastEvent } from "src/gateway/sse";
import { SpaceXEvent } from "src/gateway/types/types";

export async function handleEvent(event: SpaceXEvent) {
  if (!event?.event || !event.payload) {
    logger.warn("[Gateway] Skipped invalid event payload");
    return;
  }

  if (event.event === "ENRICH_LAUNCH") {
    const enrichedPayload = await enrichLaunchWithCache(event.payload);

    await rabbitMQ.publishEvent({ ...event, payload: enrichedPayload });
    logger.info(`[Gateway] Published enriched launch: ${enrichedPayload.launch.id}`);

    broadcastEvent({ ...event, payload: enrichedPayload });
  } else {
    await rabbitMQ.publishEvent(event);
    logger.info(`[Gateway] Published event: ${event.event}`);
  }
}
