import express, { Request, Response } from "express";
import { registerClient } from "src/gateway/lib/sse/sseManager";
import { getCollection, connectMongo } from "src/gateway/lib/mongo";
import { SpaceXEvent } from "src/gateway/types/types";

const router = express.Router();

router.get("/events", async (req: Request, res: Response) => {
  // Register this client for SSE
  registerClient(res);

  // Replay missed events if client provides a "since" timestamp
  const since = req.query.since ? new Date(req.query.since as string) : null;
  if (since) {
    try {
      const db = await connectMongo();
      const events = await getCollection<SpaceXEvent>("events")
        .find({ receivedAt: { $gt: since } })
        .toArray();

      events.forEach((event) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      });
    } catch (err) {
      console.error("[SSE] Failed to replay missed events:", err);
    }
  }

  // Keep the connection alive
  req.on("close", () => {
    console.log("[SSE] Client disconnected");
  });
});

export default router;