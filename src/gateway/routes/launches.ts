import express, { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import { Launch } from "@space-x/shared/Launch";
import dotenv from "dotenv";
import { logger } from "@space-x/shared/logger";

dotenv.config();

const router = express.Router();
const SPACEX_API = process.env.SPACEX_API;

if (!SPACEX_API) {
  throw new Error("SPACEX_API is not defined in the environment variables");
}

// GET /launches — retrieve all launches
router.get("/", async (_req: Request, res: Response) => {
  try {
    const response: AxiosResponse<Launch[]> = await axios.get(SPACEX_API);
    res.json(response.data);
  } catch (error: any) {
    logger.error("Failed to fetch all launches", error.message);
    res.status(500).json({ error: "Failed to fetch launches" });
  }
});

// GET /launches/:id — retrieve a launch by ID
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const response: AxiosResponse<Launch> = await axios.get(`${SPACEX_API}/${id}`);
    res.json(response.data);
  } catch (error: any) {
    logger.error(`Failed to fetch launch with ID ${id}`, error.message );
    if (error.response?.status === 404) {
      res.status(404).json({ error: "Launch not found" });
    } else {
      res.status(500).json({ error: "Failed to fetch launch" });
    }
  }
});

export default router;
