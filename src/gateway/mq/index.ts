import amqp, { Channel } from "amqplib";
import { logger } from "@space-x/shared/logger";
import { SpaceXEvent } from "../types/types";

const QUEUE_NAME = "spacex.events";

export class RabbitMQ {
  private conn: any;
  private channel: any;
  private isConnecting = false;

  // Buffer events when RabbitMQ is unavailable
  private eventBuffer: SpaceXEvent[] = [];
  private flushIntervalMs = 1000;
  private lastPublishAttempt: Date | null = null;

  constructor(private url: string = process.env.RABBITMQ_URL || "amqp://localhost") {}

  /** Connect to RabbitMQ with retries and auto-reconnect */
  public async connectRabbitMQ(retries: number = 5, delayMs: number = 2000): Promise<Channel> {
    if (this.channel) return this.channel;
    if (this.isConnecting) {
      await new Promise(res => setTimeout(res, delayMs));
      return this.channel!;
    }

    this.isConnecting = true;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.conn = await amqp.connect(this.url);
        this.channel = await this.conn.createChannel();
        await this.channel.assertQueue(QUEUE_NAME, { durable: true });

        logger.info(`[RabbitMQ] Connected and queue '${QUEUE_NAME}' asserted`);

        this.startFlushing();

        this.conn.on("close", () => {
          logger.warn("[RabbitMQ] Connection closed, attempting reconnect...");
          this.channel = null;
          this.conn = null;
          setTimeout(() => this.connectRabbitMQ(retries, 2000), 5000);
        });

        this.conn.on("error", (err:any) => {
          logger.error("[RabbitMQ] Connection error:", err);
        });

        this.isConnecting = false;
        return this.channel;
      } catch (err: any) {
        logger.error(`[RabbitMQ] Connection attempt ${attempt} failed:`, err.message);
        if (attempt < retries) {
          await new Promise(res => setTimeout(res, delayMs));
          delayMs *= 2; // exponential backoff
        } else {
          logger.warn("[RabbitMQ] Max retries reached. Will retry in background...");
          setTimeout(() => this.connectRabbitMQ(retries, 2000), 5000);
          this.isConnecting = false;
          throw err;
        }
      }
    }

    this.isConnecting = false;
    throw new Error("Failed to connect to RabbitMQ after multiple attempts");
  }

  /** Publish an event */
  public async publishEvent(event: SpaceXEvent): Promise<void> {
    this.lastPublishAttempt = new Date();

    if (!this.channel) {
      logger.warn("[RabbitMQ] Channel not ready, buffering event");
      this.eventBuffer.push(event);
      return;
    }

    const payload = Buffer.from(JSON.stringify(event));
    const ok = this.channel.sendToQueue(QUEUE_NAME, payload, { persistent: true });

    if (!ok) {
      logger.warn("[RabbitMQ] Backpressure detected, waiting for drain...");
      await new Promise<void>(resolve => this.channel?.once("drain", () => resolve()));
    }
  }

    // Expose health info for monitoring
  public getBufferHealth() {
    const firstBuffered = this.eventBuffer[0] || null;
    const timeSinceFirst = firstBuffered ? Date.now() - (firstBuffered as any).timestamp : 0;

    return {
      bufferedEvents: this.eventBuffer.length,
      timeSinceFirstBufferedMs: timeSinceFirst,
      lastPublishAttempt: this.lastPublishAttempt,
      isConnected: !!this.channel,
    };
  }

  /** Periodically flush buffered events */
  private startFlushing() {
    setInterval(async () => {
      if (!this.channel || this.eventBuffer.length === 0) return;

      const buffered = [...this.eventBuffer];
      this.eventBuffer = [];

      for (const event of buffered) {
        try {
          await this.publishEvent(event);
        } catch (err) {
          logger.error("[RabbitMQ] Failed to publish buffered event, re-buffering:", err);
          this.eventBuffer.push(event);
        }
      }
    }, this.flushIntervalMs);
  }

  /** Close RabbitMQ gracefully */
  public async closeRabbitMQ(): Promise<void> {
    await this.channel?.close();
    await this.conn?.close();
    this.channel = null;
    this.conn = null;
    logger.info("[RabbitMQ] Connection closed");
  }

  /** Health info */
  public getHealth() {
    const firstBuffered = this.eventBuffer[0] || null;
    const timeSinceFirst = firstBuffered ? Date.now() - (firstBuffered as any).timestamp : 0;

    return {
      bufferedEvents: this.eventBuffer.length,
      timeSinceFirstBufferedMs: timeSinceFirst,
      lastPublishAttempt: this.lastPublishAttempt,
      isConnected: !!this.channel,
    };
  }
}

// Export a singleton instance
export const rabbitMQ = new RabbitMQ();