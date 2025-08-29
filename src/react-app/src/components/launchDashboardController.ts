import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSSE } from "../hooks/useSSE";
import type { RootState } from "../store";

export function useLaunchDashboardController(apiUrl: string) {
  // SSE connection
  useSSE(apiUrl);

  // Get enriched launches from Redux
  const enrichedLaunches = useSelector(
    (state: RootState) => state.launch.enrichedLaunches
  );

  // Track recently added launches
  const [recentIds, setRecentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (enrichedLaunches.length === 0) return;

    const latest = enrichedLaunches[enrichedLaunches.length - 1].id;
    setRecentIds((prev) => new Set([latest, ...Array.from(prev)]));

    const timer = setTimeout(() => {
      setRecentIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(latest);
        return newSet;
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [enrichedLaunches]);

  return { enrichedLaunches, recentIds };
}
