import { createClient } from "redis";
import { logger } from "@space-x/shared/logger";
import { broadcastEvent } from "src/gateway/lib/sse/sseManager";
import { SpaceXEvent, Rocket, Ship, Payload, EnrichedLaunchPayload } from "src/gateway/types/types";

export async function startSubscriber() {
  const subscriber = createClient({ url: process.env.REDIS_URL });
  const worker = createClient({ url: process.env.REDIS_URL }); 

  await subscriber.connect();
  await worker.connect();

  logger.info("[Redis Subscriber] Listening on 'events' channel");

  await subscriber.subscribe("events", async (message) => {
    try {
      const parsed = JSON.parse(message) as SpaceXEvent & { source?: string };

      // Skip self-published events
      if (parsed.source === "gateway") return;

      // Determine unique launch id for deduplication
      const launchId = parsed.payload?.id || parsed.payload?.launch?.id;
      if (!launchId) {
        logger.warn(`[Redis Subscriber] Event missing launch id: ${parsed.event}`);
        return;
      }

      const dedupKey = `event:${launchId}`;
      const exists = await worker.get(dedupKey);
      if (exists) return;

      await worker.set(dedupKey, "1", { EX: 3600 });

      // Normalize event type
      let event: SpaceXEvent;
      switch (parsed.event) {
        case "LOAD_ROCKETS":
          event = { event: "LOAD_ROCKETS", payload: parsed.payload as Rocket[], source: parsed.source };
          break;
        case "LOAD_SHIPS":
          event = { event: "LOAD_SHIPS", payload: parsed.payload as Ship[], source: parsed.source };
          break;
        case "LOAD_PAYLOADS":
          event = { event: "LOAD_PAYLOADS", payload: parsed.payload as Payload[], source: parsed.source };
          break;
        case "ENRICH_LAUNCH":
          event = { event: "ENRICH_LAUNCH", payload: parsed.payload as EnrichedLaunchPayload, source: parsed.source };
          break;
        default:
          event = { event: "OTHER_EVENT", payload: parsed.payload, source: parsed.source };
      }

      broadcastEvent(event);
      logger.info(`[Redis Subscriber] Processed event: ${event.event}, launchId: ${launchId}`);
    } catch (err) {
      logger.error("[Redis Subscriber] Failed to process message:", err);
    }
  });
}