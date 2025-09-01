import { createClient } from "redis";
import { logger } from "@space-x/shared/logger";
import { config } from "../config/env";

export const redis = createClient({ url: config.REDIS_URL });

redis.on("connect", () => {
  logger.info(`[Redis] Connected to ${config.REDIS_URL}`);
});

redis.on("error", (err) => {
  logger.error("[Redis] Error:", err);
});

export async function connectRedis() {
  if (!redis.isOpen) {
    try {
      await redis.connect();
    } catch (err) {
      logger.error("[Redis] Failed to connect:", err);
      throw err;
    }
  }
}

/** Gracefully close Redis on shutdown */
export async function disconnectRedis() {
  if (redis.isOpen) {
    try {
      await redis.quit();
      logger.info("[Redis] Connection closed");
    } catch (err) {
      logger.error("[Redis] Failed to close connection:", err);
    }
  }
}