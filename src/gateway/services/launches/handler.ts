import { enrichLaunchWithCache } from "./enrich";
import { rabbitMQ } from "src/gateway/mq";
import { broadcastEvent } from "src/gateway/lib/sse/sseManager";
import { SpaceXEvent } from "src/gateway/types/types";
import { getCollection } from "src/gateway/lib/mongo";
import { connectRedis, redis } from "src/gateway/lib/redisClient";
import { logger } from "@space-x/shared/logger";

/**
 * Handle incoming SpaceXEvent objects:
 * 1. Deduplicate by launch id
 * 2. Persist to MongoDB
 * 3. Publish to RabbitMQ
 * 4. Cache in Redis
 * 5. Broadcast via SSE
 */
export async function handleEvent(event: SpaceXEvent) {
  if (!event?.event || !event.payload) {
    logger.warn("[Gateway] Skipped invalid event payload");
    return;
  }

  const eventsCollection = getCollection("events");

  try {
    let payloadToStore = event.payload;

    // Optional enrichment
    if (event.event === "ENRICH_LAUNCH") {
      payloadToStore = await enrichLaunchWithCache(event.payload);
    }

    // Extract launch id for deduplication
    const launchId = payloadToStore.id || payloadToStore.launch?.id;
    if (!launchId) {
      logger.warn(`[Gateway] Event missing launch id: ${event.event}`);
      return;
    }

    const dedupKey = `event:${launchId}`;
    await connectRedis();

    // Check Redis for deduplication
    const exists = await redis.get(dedupKey);
    if (exists) {
      logger.info(`[Gateway] Skipping duplicate launch: ${launchId}`);
      return;
    }

    // Optional: also check MongoDB
    const existing = await eventsCollection.findOne({ id: launchId });
    if (existing) {
      logger.info(`[MongoDB] Launch already exists: ${launchId}`);
      // Ensure Redis cache is set to prevent subscriber loop
      await redis.set(dedupKey, "1", { EX: 3600 });
      return;
    }

    // Mark as processed in Redis
    await redis.set(dedupKey, "1", { EX: 3600 });

    // 1. Persist to MongoDB
    const mongoResult = await eventsCollection.insertOne({
      ...payloadToStore,
      event: event.event,
      receivedAt: new Date(),
    });
    logger.info(`[MongoDB] Persisted event: ${event.event}, launchId: ${launchId}, _id: ${mongoResult.insertedId}`);

    // 2. Publish to RabbitMQ
    try {
      await rabbitMQ.connectRabbitMQ();
      await rabbitMQ.publishEvent({
        ...event,
        payload: payloadToStore,
        timestamp: Date.now(),
        source: "gateway",
      });
      logger.info(`[RabbitMQ] Published event: ${event.event}, launchId: ${launchId}`);
    } catch (err: any) {
      logger.error(`[RabbitMQ] Failed to publish event ${event.event}:`, err?.message || err);
    }

    // 3. Cache in Redis
    try {
      const redisValue = JSON.stringify({ ...event, payload: payloadToStore, source: "gateway" });
      await redis.set(dedupKey, redisValue, { EX: 3600 });
      logger.info(`[Redis] Cached event: ${dedupKey}`);
    } catch (err: any) {
      logger.error(`[Redis] Failed to cache event ${event.event}:`, err?.message || err);
    }

    // 4. Broadcast via SSE
    try {
      broadcastEvent({ ...event, payload: payloadToStore });
      logger.info(`[SSE] Broadcasted event: ${event.event}, launchId: ${launchId}`);
    } catch (err: any) {
      logger.error(`[SSE] Failed to broadcast event ${event.event}:`, err?.message || err);
    }
  } catch (err: any) {
    logger.error(`[Gateway] handleEvent failed for ${event.event}:`, err?.message || err);
  }
}