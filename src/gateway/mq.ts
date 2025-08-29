import amqp from "amqplib";
import { SpaceXEvent } from "./types/types";

const QUEUE_NAME = "spacex.events";

export class RabbitMQ {
  private conn: any;
  private channel: any;
  private isConnecting = false;
  private lastPublishAttempt: Date | null = null;

  // Buffer for events when RabbitMQ is unavailable
  private eventBuffer: SpaceXEvent[] = [];
  private flushIntervalMs = 1000; // Try flushing buffered events every 1s

  /**
   * Connect to RabbitMQ with automatic retries. and background reconnect
   */
  public async connectRabbitMQ(url: string = process.env.RABBITMQ_URL || "amqp://localhost",
    retries: number = 5,
    delayMs: number = 2000
  ): Promise<amqp.Channel> {

    if (this.channel) return this.channel;
    if (this.isConnecting) {
      // wait a bit if already connecting
      await new Promise((res) => setTimeout(res, delayMs));
      return this.channel!;
    }

    this.isConnecting = true;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.conn = await amqp.connect(url);
        this.channel = await this.conn.createChannel();
        await this.channel.assertQueue(QUEUE_NAME);

        console.log(`[RabbitMQ] Connected and queue asserted`);

        // Start flushing buffered events
        this.startFlushing();

        // Handle unexpected connection close
        this.conn.on("close", () => {
          console.warn("[RabbitMQ] Connection closed. Reconnecting...");
          this.channel = null;
          this.conn = null;
          setTimeout(() => this.connectRabbitMQ(url, retries, 2000), 5000);
        });

        this.conn.on("error", (err: any) => {
          console.error("[RabbitMQ] Connection error:", err.message);
        });

        this.isConnecting = false;
        return this.channel;
      } catch (err: any) {
        console.error(`[RabbitMQ] Connection attempt ${attempt} failed:`, err.message);
        if (attempt < retries) {
          console.log(`Retrying in ${delayMs}ms...`);
          await new Promise((res) => setTimeout(res, delayMs));
          delayMs *= 2; // exponential backoff
        } else {
          console.warn("[RabbitMQ] Max retries reached. Will retry in background...");
          setTimeout(() => this.connectRabbitMQ(url, retries, 2000), 5000);
          this.isConnecting = false;
          throw err;
        }
      }
    }
    this.isConnecting = false;
    throw new Error("Failed to connect to RabbitMQ after multiple attempts");
  }

  /**
   * Publish an event to the queue
   */
  public async publishEvent(event: SpaceXEvent): Promise<void> {
    
    this.lastPublishAttempt = new Date(); // Track when we attempted publishing

    if (!this.channel) {
      console.warn("[RabbitMQ] Channel not ready, buffering event");
      this.eventBuffer.push(event);
      return;
    }

    const payload = Buffer.from(JSON.stringify(event));

    // Send to queue, handle backpressure if channel buffer is full
    // Durable queue and persistent messages – ensures messages aren’t lost if RabbitMQ restarts.
    const ok = this.channel.sendToQueue(QUEUE_NAME, payload, { persistent: true });
    if (!ok) {
      console.warn("[RabbitMQ] Backpressure detected, waiting for drain...");
      await new Promise<void>((resolve) => {
        this.channel?.once("drain", () => resolve());
      });
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

  /**
  * Flush buffered events periodically
  */
  private startFlushing() {
    setInterval(async () => {
      if (!this.channel || this.eventBuffer.length === 0) return;

      const buffered = [...this.eventBuffer];
      this.eventBuffer = [];

      for (const event of buffered) {
        try {
          await this.publishEvent(event);
        } catch (err) {
          console.error("[RabbitMQ] Failed to publish buffered event, re-buffering:", err);
          this.eventBuffer.push(event);
        }
      }
    }, this.flushIntervalMs);
  }

  /**
   * Close RabbitMQ connection gracefully
   */
  public async closeRabbitMQ() {
    await this.channel?.close();
    await this.conn?.close();
    this.channel = null;
    this.conn = null;
    console.log("[RabbitMQ] Connection closed");
  }
}

export const rabbitMQ = new RabbitMQ();
