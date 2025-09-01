import amqp, { Channel } from "amqplib";
import { logger } from "@space-x/shared/logger";
import { SpaceXEvent } from "../types/types";
import { config } from "../config/env";

const QUEUE_NAME = process.env.RABBITMQ_QUEUE || config.RABBITMQ_URL && (process.env.RABBITMQ_QUEUE || "spacex-events");

export class RabbitMQ {
  private conn: any;
  private channel: any;
  private isConnecting = false;
  private url: string;

  private eventBuffer: (SpaceXEvent & { timestamp?: number })[] = [];
  private flushIntervalMs = 1000;
  private lastPublishAttempt: Date | null = null;

  constructor(url: string) {
    this.url = url;
  }

  /** Connect to RabbitMQ with retries */
  public async connectRabbitMQ(retries = config.MQ_RETRIES, retryDelay = config.MQ_RETRY_DELAY): Promise<Channel> {
    if (this.channel) return this.channel;
    if (this.isConnecting) {
      await new Promise(res => setTimeout(res, retryDelay));
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
          logger.warn("[RabbitMQ] Connection closed, reconnecting...");
          this.channel = null;
          this.conn = null;
          setTimeout(() => this.connectRabbitMQ(retries, 2000), 5000);
        });

        this.conn.on("error", (err: any) => {
          logger.error("[RabbitMQ] Connection error:", err?.message || err);
        });

        this.isConnecting = false;
        return this.channel;
      } catch (err: any) {
        logger.error(`[RabbitMQ] Connection attempt ${attempt} failed:`, err?.message || err);
        if (attempt < retries) await new Promise(res => setTimeout(res, retryDelay));
        else {
          this.isConnecting = false;
          throw new Error("Max RabbitMQ connection attempts reached");
        }
      }
    }

    this.isConnecting = false;
    throw new Error("Failed to connect to RabbitMQ");
  }

  /** Publish an event safely */
  public async publishEvent(event: SpaceXEvent & { timestamp?: number }): Promise<void> {
    this.lastPublishAttempt = new Date();

    if (!this.channel) {
      logger.warn("[RabbitMQ] Channel not ready, buffering event");
      this.eventBuffer.push({ ...event, timestamp: Date.now() });
      // trigger reconnect but don't await (avoid bubbling errors to caller)
      this.connectRabbitMQ().catch(err => logger.error("[RabbitMQ] Reconnect attempt failed:", { message: err?.message, stack: err?.stack }));
      return;
    }

    try {
      const payload = Buffer.from(JSON.stringify(event));
      const sent = this.channel.sendToQueue(QUEUE_NAME, payload, { persistent: true });

      if (!sent) {
        logger.warn("[RabbitMQ] Backpressure detected, waiting for drain...");
        await new Promise<void>(resolve => this.channel!.once("drain", resolve));
      }

      logger.info(`[RabbitMQ] Published event: ${event.event}`);
    } catch (err: any) {
      logger.error(`[RabbitMQ] Failed to publish event ${event.event}:`, err?.message || err);
      this.eventBuffer.push({ ...event, timestamp: Date.now() });
    }
  }

  /** Expose health info for monitoring */  
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

  /** Flush buffered events periodically */
  private startFlushing() {
    setInterval(async () => {
      if (!this.channel || this.eventBuffer.length === 0) return;

      const bufferCopy = [...this.eventBuffer];
      this.eventBuffer = [];

      for (const event of bufferCopy) {
        try {
          await this.publishEvent(event);
        } catch (err: any) {
          logger.error("[RabbitMQ] Failed to flush buffered event, re-buffering:", err?.message || err);
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
    return {
      bufferedEvents: this.eventBuffer.length,
      lastPublishAttempt: this.lastPublishAttempt,
      isConnected: !!this.channel,
    };
  }
}

// singleton
export const rabbitMQ = new RabbitMQ(process.env.RABBITMQ_URL || "amqp://localhost");
