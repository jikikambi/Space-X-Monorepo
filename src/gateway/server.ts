import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { logger } from "@space-x/shared/logger";

import { rabbitMQ } from "./mq";
import { startConsumer } from "./mq/consumer";
import eventsRouter from "./services/events/sseRoutes";
import launchesRouter from "./services/launches/routes";
import { connectMongo } from "./lib/mongo";
import { connectRedis, disconnectRedis, redis } from "./lib/redisClient";
import { startSubscriber } from "./services/events/subscriber";
import mqEndpoints from "./mq/mqendpoints";

// Load env
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  debug: process.env.NODE_ENV !== "production"
});

const app = express();
app.use(cors({ origin: "*", methods: ["GET","POST","PUT","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.get("/health", (_req, res) => res.send("Gateway is healthy"));
app.use("/sse", eventsRouter);
app.use("/launches", launchesRouter);
//app.use("/rabbitmq", mqEndpoints);

const DEFAULT_PORT = parseInt(process.env.PORT || "4000", 10);
let server: any;
const connections = new Set<any>();

async function startServer(port: number = DEFAULT_PORT) {
   await connectRedis();
   
  try {
    await connectMongo();
    logger.info("[MongoDB] Connected");

    const channel = await rabbitMQ.connectRabbitMQ(5, 2000);
    await startConsumer(channel);

    // Start Redis subscriber once
    await startSubscriber();

    server = app.listen(port, () => logger.info(`Gateway running on port ${port}`));

    server.on("connection", (socket: any) => {
      connections.add(socket);
      socket.on("close", () => connections.delete(socket));
    });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        logger.warn(`Port ${port} in use, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        logger.error("Server failed to start:", err);
        process.exit(1);
      }
    });

  } catch (err: any) {
    logger.error("Failed to start Gateway:", err);
    process.exit(1);
  }
}

async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down...`);

  if (server) server.close(() => logger.info("HTTP server closed"));
  setTimeout(() => { for (const socket of connections) socket.destroy(); }, 10000);

  try { await rabbitMQ.closeRabbitMQ(); logger.info("RabbitMQ connection closed"); }
  catch (err: any) { logger.error("Error closing RabbitMQ:", err); }

  try { await redis.quit(); logger.info("Redis connection closed"); }
  catch (err: any) { logger.error("Error closing Redis:", err); }

  console.log("\n Shutting down...");
  await disconnectRedis();
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});