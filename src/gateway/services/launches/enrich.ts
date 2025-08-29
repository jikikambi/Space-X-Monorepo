import { redisClient } from "src/gateway/config/redisClient";
import { EnrichedLaunchPayload } from "src/gateway/types/types";
import { fetchLaunch, fetchRocket, fetchPayloads, fetchShips } from "./api";

export async function enrichLaunchWithCache(payload: { id: string } | EnrichedLaunchPayload): Promise<EnrichedLaunchPayload> {
  if ("launch" in payload) return payload;

  const cacheKey = `enrichedLaunch:${payload.id}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const launch = await fetchLaunch(payload.id);
  const [rocket, payloads, ships] = await Promise.all([
    fetchRocket(launch.rocket),
    fetchPayloads(launch.payloads),
    fetchShips(launch.ships),
  ]);

  const enriched: EnrichedLaunchPayload = { launch, rocket, payloads, ships };
  await redisClient.set(cacheKey, JSON.stringify(enriched), "EX", 300);
  return enriched;
}
