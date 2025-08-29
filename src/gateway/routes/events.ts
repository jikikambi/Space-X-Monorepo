import express from "express";
import { registerClient } from "../sse";

const router = express.Router();

router.get("/", (req, res) => {
  registerClient(res);
});

export default router;





// import express, { Request, Response } from "express";
// import { publishEvent } from "../mq";

// const router = express.Router();

// // POST /events
// router.post("/", async (req: Request, res: Response) => {
//   const { event, payload } = req.body;

//   if (!event) {
//     return res.status(400).json({ error: "event is required" });
//   }

//   publishEvent(event, payload || {});
//   res.json({ status: "ok", event });
// });

// export default router;
