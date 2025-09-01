import { EnrichedLaunchPayload } from "src/gateway/types/types";
import { fetchLaunch, fetchRocket, fetchPayloads, fetchShips } from "./api";
import { redis } from "src/gateway/lib/redisClient";

export async function enrichLaunchWithCache(
  payload: { id: string } | EnrichedLaunchPayload
): Promise<EnrichedLaunchPayload> {
  if ("launch" in payload) return payload;

  const cacheKey = `enrichedLaunch:${payload.id}`;

  // Check Redis cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as EnrichedLaunchPayload;

  // Fetch launch and related resources
  const launch = await fetchLaunch(payload.id);
  const [rocket, payloads, ships] = await Promise.all([
    fetchRocket(launch.rocket),
    fetchPayloads(launch.payloads || []),
    fetchShips(launch.ships || []),
  ]);

  const enriched: EnrichedLaunchPayload = { launch, rocket, payloads, ships };
  
  await redis.set(cacheKey, JSON.stringify(enriched), { EX: 300 });
  return enriched;
}
