import express from "express";
import { registerClient } from "../sse/sseManager";

const router = express.Router();

router.get("/events", (req, res) => {
  registerClient(res);
});

export default router;