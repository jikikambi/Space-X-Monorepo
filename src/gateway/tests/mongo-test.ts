import { MongoClient } from "mongodb";
import { config } from "../config/env";

async function testMongoConnection() {
  try {
    const client = new MongoClient(config.MONGO_URL);
    await client.connect();

    const db = client.db(config.MONGO_DB_NAME);
    const collections = await db.collections();

    console.log(`[MongoDB Test] Connected to ${config.MONGO_DB_NAME}`);
    console.log(`[MongoDB Test] Collections:`, collections.map(c => c.collectionName));

    await client.close();
    console.log("[MongoDB Test] Connection closed successfully");
  } catch (err: any) {
    console.error("[MongoDB Test] Connection failed:", err.message || err);
    process.exit(1);
  }
}

testMongoConnection();
