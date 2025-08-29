import { useEffect, useState } from "react";
import { logger } from "@space-x/shared/logger";

export interface SpaceXEvent {
  event: string;
  payload: any;
}

export function useSSE(url: string) {
  const [events, setEvents] = useState<SpaceXEvent[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (msg) => {
      try {
        const event: SpaceXEvent = JSON.parse(msg.data);
        setEvents((prev) => [...prev, event]);
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
  }, [url]);

  return events;
}
