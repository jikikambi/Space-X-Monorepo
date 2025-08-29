import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { logger } from "@space-x/shared/logger";

import { rabbitMQ } from "./mq";
import eventsRouter from "./routes/sseEvents";
import mqEndpoints from "./routes/mqendpoints";
import { startConsumer } from "./mq/consumer";
import launchesRouter from "./services/launches/routes";

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  debug: process.env.NODE_ENV !== "production",
});

const app = express();

// -------------------------------
// Middleware
// -------------------------------
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// -------------------------------
// Routes
// -------------------------------
app.get("/health", (_req: Request, res: Response) => res.send("Gateway is healthy"));
app.use("/sse", eventsRouter);
app.use("/launches", launchesRouter);
app.use("/rabbitmq", mqEndpoints);

// -------------------------------
// Server and RabbitMQ setup
// -------------------------------
const DEFAULT_PORT = parseInt(process.env.PORT || "4000", 10);
let server: any;
const connections = new Set<any>();

async function startServer(port: number = DEFAULT_PORT) {
  try {
    const channel = await rabbitMQ.connectRabbitMQ(5, 2000); // retries and delay
    await startConsumer(channel);

    server = app.listen(port, () => {
      logger.info(`Gateway running on port ${port}`);
    });

    // Track active connections for graceful shutdown
    server.on("connection", (socket: any) => {
      connections.add(socket);
      socket.on("close", () => connections.delete(socket));
    });

    // Handle port already in use
    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        logger.warn(`Port ${port} in use, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        logger.error("Server failed to start:", err);
        process.exit(1);
      }
    });

    // Log buffered RabbitMQ events periodically
    setInterval(() => {
      const buffered = (rabbitMQ as any).eventBuffer?.length || 0;
      if (buffered > 0) {
        logger.info(`[RabbitMQ] Buffered events: ${buffered}`);
      }
    }, 5000);

  } catch (err: any) {
    logger.error("Failed to start Gateway:", err);
    process.exit(1);
  }
}

// -------------------------------
// Graceful shutdown
// -------------------------------
async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down...`);

  if (server) server.close(() => logger.info("HTTP server closed"));

  setTimeout(() => {
    for (const socket of connections) socket.destroy();
  }, 10000); // force close after 10s

  try {
    await rabbitMQ.closeRabbitMQ();
    logger.info("RabbitMQ connection closed");
  } catch (err: any) {
    logger.error("Error closing RabbitMQ:", err);
  }

  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// -------------------------------
// Start the server
// -------------------------------
startServer();