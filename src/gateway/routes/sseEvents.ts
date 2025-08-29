import express from "express";
import { registerClient } from "../sse";

const router = express.Router();

router.get("/events", (req, res) => {
  registerClient(res);
});

export default router;