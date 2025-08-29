import React from "react";
import { useLaunchDashboardController } from "./launchDashboardController";
import { RocketCard } from "./RocketCard";
import { PayloadList } from "./PayloadList";
import { ShipList } from "./ShipList";

export const LaunchDashboard: React.FC = () => {

   const baseUrl = import.meta.env.VITE_API_BASE_URL; 

   if (!baseUrl) {
      console.error("VITE_API_BASE_URL is not defined in .env");
      return;
    }
     
  const { enrichedLaunches, recentIds } = useLaunchDashboardController(
    `${baseUrl}/sse/events`
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Enriched Launches</h2>

      {enrichedLaunches.length === 0 && (
        <p className="text-gray-500">No launches yet...</p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enrichedLaunches.map((launch) => (
          <div
            key={launch.id}
            className={`bg-white rounded-lg shadow-md p-5 border border-gray-200 transition-all duration-500 hover:shadow-lg ${
              recentIds.has(launch.id) ? "ring-4 ring-blue-300 animate-pulse" : ""
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold">{launch.name}</h3>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  launch.success === null
                    ? "bg-gray-300 text-gray-800"
                    : launch.success
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {launch.success === null
                  ? "Unknown"
                  : launch.success
                  ? "Success"
                  : "Failure"}
              </span>
            </div>

            <p className="text-gray-600 mb-3">
              <span className="font-medium">Launch Date:</span>{" "}
              {new Date(launch.date_utc).toLocaleString()}
            </p>

            {/* Child components handle optional data internally */}
            <RocketCard rocket={launch.rocketData} />
            <PayloadList payloads={launch.payloadData} />
            <ShipList ships={launch.shipData} />

            {launch.details && (
              <p className="text-gray-800 mb-2">
                <span className="font-semibold">Details:</span> {launch.details}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
