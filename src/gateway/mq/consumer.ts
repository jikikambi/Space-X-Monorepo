import { Channel } from "amqplib";
import { logger } from "@space-x/shared/logger";
import { handleEvent } from "../services/launches/handler";

/** Starts consuming messages from RabbitMQ and forwards them to handlers. */
export async function startConsumer(channel: Channel) {
  const queue = process.env.RABBITMQ_QUEUE || "spacex-events";

  await channel.assertQueue(queue, { durable: true });

  logger.info(`[RabbitMQ] Consuming messages from queue: ${queue}`);

  await channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());
      await handleEvent(event);
      channel.ack(msg);
    } catch (err) {
      logger.error("[RabbitMQ] Failed to process message:", err);
      channel.nack(msg, false, false);
    }
  }, { noAck: false });
}