import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

interface Env {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  RABBITMQ_URL: string;
  SPACEX_API: string;
  REDIS_URL: string;
  MQ_RETRIES: number;
  MQ_RETRY_DELAY: number;
  MONGO_URL: string;
  MONGO_DB_NAME: string;
}

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing required env variable: ${key}`);
  return value;
}

// Determine Mongo host: use Docker service name if running inside container
const dockerHost = "mongo";
let mongoHost = process.env.MONGO_HOST || dockerHost;
const mongoPort = process.env.MONGO_PORT || "27017";
const mongoDbName = process.env.MONGO_DB_NAME || "spacex_gateway";
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;

// Build Mongo URL with authSource=admin
const mongoAuthPart = mongoUser && mongoPassword ? `${mongoUser}:${mongoPassword}@` : "";
const mongoUrl = process.env.MONGO_URL || `mongodb://${mongoAuthPart}${mongoHost}:${mongoPort}/${mongoDbName}?authSource=admin`;

export const config: Env = {
  NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) || "development",
  PORT: parseInt(process.env.PORT || "4000", 10),
  RABBITMQ_URL: requireEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672"),
  SPACEX_API: requireEnv("SPACEX_API", "https://api.spacexdata.com/v5/launches"),
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  MQ_RETRIES: parseInt(process.env.RABBITMQ_RETRIES || "5", 10),
  MQ_RETRY_DELAY: parseInt(process.env.RABBITMQ_RETRY_DELAY || "2000", 10),
  MONGO_URL: mongoUrl,
  MONGO_DB_NAME: mongoDbName,
};