import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from 'path';
import {logger} from "@space-x/shared/logger";


dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  debug: process.env.NODE_ENV !== 'production' 
});

const app = express();
app.use(bodyParser.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.send('Gateway is healthy');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Gateway running on port ${PORT}`);
});