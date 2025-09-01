import express, { Request } from "express";
import { handleEvent } from "./handler";
import { enrichLaunchWithCache } from "./enrich";
import { logger } from "@space-x/shared/logger";
import { rabbitMQ } from "src/gateway/mq";

const router = express.Router();

router.post("/publish", async (req: Request, res) => {
  try {
    if (!rabbitMQ) throw new Error("RabbitMQ not initialized");

    const body = req.body;
    if (Array.isArray(body)) {
      await Promise.all(body.map((event) => handleEvent(event)));
    } else if (typeof body === "object" && body !== null) {
      await handleEvent(body);
    } else {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }

    res.status(200).json({ success: true });
  } catch (err:any) {
    logger.error("[Gateway] Failed to publish events:", { message: err?.message ?? String(err), stack: err?.stack });
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res) => {
  try {
    const enriched = await enrichLaunchWithCache({ id: req.params.id });
    res.json(enriched);
  } catch (err) {
    logger.error("[Gateway] Failed to fetch enriched launch:", err);
    res.status(500).json({ error: "Failed to fetch enriched launch" });
  }
});

export default router;
