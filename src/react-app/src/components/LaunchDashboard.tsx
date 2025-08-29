import React from "react";
import { useSSE } from "../hooks/useSSE";

import type { Launch } from "@space-x/shared/Launch";

export const LaunchDashboard: React.FC = () => {
  const events = useSSE(`${import.meta.env.VITE_API_BASE_URL}/sse/events`);

  const enrichedLaunches = events
    .filter((e) => e.event === "ENRICH_LAUNCH")
    .map((e) => e.payload as Launch);

  return (
    <div>
      <h2>Enriched Launches</h2>
      {enrichedLaunches.map((launch) => (
        <div key={launch.id} style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}>
          <h3>{launch.name}</h3>
          <p>Launch Date: {new Date(launch.date_utc).toLocaleString()}</p>

          <h4>Rocket:</h4>
          <pre>{JSON.stringify(launch.rocket, null, 2)}</pre>

          <h4>Payloads:</h4>
          <pre>{JSON.stringify(launch.payloads, null, 2)}</pre>

          <h4>Ships:</h4>
          <pre>{JSON.stringify(launch.ships, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};
