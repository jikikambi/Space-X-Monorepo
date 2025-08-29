import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addEnrichedLaunch } from "../store/slices/launchSlice";
import { logger } from "@space-x/shared/logger";
import type { EnrichedLaunch } from "../store/slices/launchSlice";

export interface SpaceXEvent {
  event: string;
  payload: any;
}

/**
 * Custom hook to consume SSE from /launches/stream
 * @param url - SSE endpoint URL
 */
export function useSSE(url: string): void {
  const dispatch = useDispatch();

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (msg: MessageEvent) => {
      try {
        const event: SpaceXEvent = JSON.parse(msg.data);

        if (event.event === "ENRICH_LAUNCH") {
          // Combine launch + enrichment into Redux-friendly format
          const enriched: EnrichedLaunch = {
            ...event.payload.launch,
            rocketData: event.payload.rocket,
            payloadData: event.payload.payloads,
            shipData: event.payload.ships,
          };

          dispatch(addEnrichedLaunch(enriched));
        }
      } catch (err) {
        logger.error("[SSE] Failed to parse event:", err);
      }
    };

    eventSource.onerror = (err) => {
      logger.error("[SSE] Connection error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [url, dispatch]);
}