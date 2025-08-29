import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import cors from "cors"; 
import { logger } from "@space-x/shared/logger";

import { rabbitMQ } from "./mq";
import { startConsumer } from "./consumer";
import eventsRouter from "./routes/events";
import launchesRouter from "./routes/launchEnricher";
import mqEndpoints from "./routes/mqendpoints";

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  debug: process.env.NODE_ENV !== "production",
});

const app = express();

// Enable CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Increase payload limit
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Health check
app.get("/health", (_req: Request, res: Response) => res.send("Gateway is healthy"));

// SSE endpoint
app.use("/sse/events", eventsRouter);

// Launches endpoint
app.use("/launches", launchesRouter);

//  RabbitMQ health endpoint
app.use("/rabbitmq", mqEndpoints);

const DEFAULT_PORT = parseInt(process.env.PORT || "4000", 10);
let server: any;

// Track active connections
const connections = new Set<any>();

/**
 * Start Express server and RabbitMQ consumer.
 */
async function startServer(port: number = DEFAULT_PORT) {
  try {
    const channel = await rabbitMQ.connectRabbitMQ(
      process.env.RABBITMQ_URL,
      5,    // max retries
      2000  // initial delay ms
    );
    await startConsumer(channel);

    server = app.listen(port, () => {
      logger.info(`Gateway running on port ${port}`);
    });

    // Track active connections
    server.on("connection", (socket: any) => {
      connections.add(socket);
      socket.on("close", () => connections.delete(socket));
    });

    // Port already in use: try next port
    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        logger.warn(`Port ${port} is in use, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        logger.error("Server failed to start:", err);
        process.exit(1);
      }
    });

    // Periodically log number of buffered events
    setInterval(() => {
      if ((rabbitMQ as any).eventBuffer?.length) {
        logger.info(`[RabbitMQ] Buffered events: ${(rabbitMQ as any).eventBuffer.length}`);
      }
    }, 5000); // every 5 seconds

  } catch (err: any) {
    logger.error("Failed to start Gateway:", err);
    process.exit(1);
  }
}

/**
 * Gracefully shutdown server and RabbitMQ.
 */
async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down...`);

  // Stop accepting new connections
  if (server) server.close(() => logger.info("HTTP server closed"));

  // Force close any active connections after timeout
  setTimeout(() => {
    for (const socket of connections) {
      socket.destroy();
    }
  }, 10000); // 10 seconds timeout

  try {
    await rabbitMQ.closeRabbitMQ();
    logger.info("RabbitMQ connection closed");
  } catch (err: any) {
    logger.error("Error closing RabbitMQ:", err);
  }

  process.exit(0);
}

// Listen for termination signals
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Start server
startServer();
