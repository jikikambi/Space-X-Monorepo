import { rabbitMQ } from "../mq";
import { SpaceXEvent } from "../types/types";

async function testPublish() {
  try {
    // Connect using the singleton
    await rabbitMQ.connectRabbitMQ();

    const event: SpaceXEvent = {
      event: "LOAD_ROCKETS",
      payload: [
        { id: "3", name: "Falcon 10" },
        { id: "4", name: "Starship" }
      ]
    };

    // Publish the event
    rabbitMQ.publishEvent(event);

    console.log("Test event published to RabbitMQ");

    // Wait a short delay to ensure the message is flushed
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (err) {
    console.error("Error during testPublish:", err);
  } finally {
    // Close connection gracefully
    await rabbitMQ.closeRabbitMQ();
    process.exit(0);
  }
}

testPublish();
