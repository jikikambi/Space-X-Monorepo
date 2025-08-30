// src/gateway/config/env.ts
import dotenv from "dotenv";
import path from "path";

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Define a TypeScript interface for env
interface Env {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  RABBITMQ_URL: string;
  SPACEX_API: string;
  REDIS_URL: string;
  MQ_RETRIES: number;
  MQ_RETRY_DELAY: number;
}

// Helper to require a variable
function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing required env variable: ${key}`);
  return value;
}

// Export typed config
export const config: Env = {
  NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) || "development",
  PORT: parseInt(process.env.PORT || "4000", 10),
  RABBITMQ_URL: requireEnv("RABBITMQ_URL", "amqp://localhost"),
  SPACEX_API: requireEnv("SPACEX_API", "https://api.spacexdata.com/v5/launches"),
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  MQ_RETRIES: parseInt(process.env.RABBITMQ_RETRIES || "5", 10),
  MQ_RETRY_DELAY: parseInt(process.env.RABBITMQ_RETRY_DELAY || "2000", 10),
};
