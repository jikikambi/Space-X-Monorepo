import { MongoClient, Db, Collection, Document } from "mongodb";
import { config } from "../config/env";
import { logger } from "@space-x/shared/logger";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (db) return db;

  try {
    client = new MongoClient(config.MONGO_URL);
    await client.connect();
    db = client.db(config.MONGO_DB_NAME);
    logger.info(`[MongoDB] Connected to ${config.MONGO_DB_NAME} at ${config.MONGO_URL}`);
    return db;
  } catch (err) {
    logger.error("[MongoDB] Connection failed:", err);
    throw err;
  }
}

/** Get a MongoDB collection */
export function getCollection<T extends Document = Document>(name: string): Collection<T> {
  if (!db) throw new Error("[MongoDB] Not connected. Call connectMongo() first.");
  return db.collection<T>(name);
}

/** Gracefully close the Mongo connection */
export async function closeMongo() {
  if (client) {
    await client.close();
    logger.info("[MongoDB] Connection closed");
    client = null;
    db = null;
  }
}