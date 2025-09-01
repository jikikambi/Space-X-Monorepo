import { getCollection } from "src/gateway/lib/mongo";
import { redis } from "src/gateway/lib/redisClient";
import { SpaceXEvent } from "src/gateway/types/types";

/**
 * Publish an event:
 * - Store in MongoDB (persistent log)
 * - Publish to Redis (for real-time subscribers)
 */
export async function handleBroadcast(event: SpaceXEvent) {
  const events = getCollection("events");

  await events.insertOne({
    ...event,
    createdAt: new Date(),
  });

  await redis.publish("events", JSON.stringify(event));
}