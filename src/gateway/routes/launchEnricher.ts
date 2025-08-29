import express, { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import JSONStream from "JSONStream";
import { logger } from "@space-x/shared/logger";
import { rabbitMQ } from "../mq";
import { SpaceXEvent } from "../types/types";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const router = express.Router();

const SPACEX_API = process.env.SPACEX_API!;
if (!SPACEX_API) {
  throw new Error("SPACEX_API is not defined in the environment variables");
}

/**
 * Helpers to fetch related resources by ID
 */
async function fetchRocket(rocketId: string) {
  if (!rocketId) return null;
  const res = await axios.get(`${SPACEX_API.replace("/launches", "/rockets")}/${rocketId}`);
  return res.data;
}

async function fetchPayloads(payloadIds: string[]) {
  if (!payloadIds?.length) return [];
  return Promise.all(
    payloadIds.map((id) =>
      axios.get(`${SPACEX_API.replace("/launches", "/payloads")}/${id}`).then((r) => r.data)
    )
  );
}

async function fetchShips(shipIds: string[]) {
  if (!shipIds?.length) return [];
  return Promise.all(
    shipIds.map((id) =>
      axios.get(`${SPACEX_API.replace("/launches", "/ships")}/${id}`).then((r) => r.data)
    )
  );
}

/**
 * Enrichment pipeline:
 * 1. Vue sends a launch_selected event with the launch *ID*.
 * 2. Gateway fetches the "base launch" from /launches/:id (contains only IDs for rocket, payloads, ships).
 * 3. Resolve those IDs into full objects (rocket, payloads, ships).
 * 4. Combine everything into a single enriched launch object.
 */
async function enrichLaunch(launch: any) {
  const [rocket, payloads, ships] = await Promise.all([
    fetchRocket(launch.rocket),
    fetchPayloads(launch.payloads),
    fetchShips(launch.ships),
  ]);

  return { ...launch, rocket, payloads, ships };
}

/**
 * POST /launches/publish
 * - Accepts JSONStream of events from the Vue app
 * - If event = launch_selected → enrich before publishing
 * - Otherwise, just forward event to RabbitMQ
 */
router.post("/publish", async (req: Request, res: Response) => {
  try {
    if (!rabbitMQ) throw new Error("RabbitMQ not initialized");

    const parser = JSONStream.parse<SpaceXEvent>("*");
    req.pipe(parser);

    parser.on("data", async (event: SpaceXEvent) => {
      try {
        if (event?.event === "ENRICH_LAUNCH" && event.payload) {
          // Step 1: Enrich the launch with rocket/payloads/ships
          const enrichedLaunch = await enrichLaunch(event.payload);

          // Step 2: Publish enriched object
          await rabbitMQ.publishEvent({ ...event, payload: enrichedLaunch });
          logger.info(`[Gateway] Published enriched launch: ${enrichedLaunch.id}`);
        } else if (event?.event) {
          // Non-launch events → forward as is
          await rabbitMQ.publishEvent(event);
          logger.info(`[Gateway] Published event: ${event.event}`);
        } else {
          logger.warn("[Gateway] Skipped invalid event payload");
        }
      } catch (err: unknown) {
        logger.error("[Gateway] Failed to publish event:", err);
      }
    });

    parser.on("end", () => {
      res.status(200).json({ success: true, message: "All events published" });
    });

    parser.on("error", (err: Error) => {
      logger.error("Error parsing JSON stream:", err);
      res.status(400).json({ success: false, error: "Invalid JSON payload" });
    });
  } catch (err: unknown) {
    logger.error("Failed to publish events:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
