import request from "supertest";
import express, { Express } from "express";
import dotenv from "dotenv";
import launchesRouter from "../routes/launches";

// Load environment variables
dotenv.config();

const app: Express = express();
app.use("/launches", launchesRouter);

describe("Launches API", () => {
  it("should return all launches", async () => {
    const res = await request(app).get("/launches");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Optionally, check a few fields in the first launch
    if (res.body.length > 0) {
      const launch = res.body[0];
      expect(launch).toHaveProperty("id");
      expect(launch).toHaveProperty("name");
      expect(launch).toHaveProperty("date_utc");
    }
  });

  it("should return a specific launch by ID", async () => {
    // First, get all launches
    const allRes = await request(app).get("/launches");
    const firstLaunchId = allRes.body[0]?.id;
    if (!firstLaunchId) return;

    const res = await request(app).get(`/launches/${firstLaunchId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", firstLaunchId);
    expect(res.body).toHaveProperty("name");
  });

  it("should return 404 for invalid launch ID", async () => {
    const res = await request(app).get("/launches/invalid-id");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Launch not found");
  });
});
