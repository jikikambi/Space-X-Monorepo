import React from "react";
import type { Rocket } from "../types/launchTypes";

interface RocketCardProps {
  rocket?: Rocket;
}

export const RocketCard: React.FC<RocketCardProps> = ({ rocket }) => {
  if (!rocket) return null;

  return (
    <div className="mb-3">
      <h4 className="text-lg font-medium mb-2">Rocket</h4>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-semibold">{rocket.name}</span>
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {rocket.type}
        </span>
        <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
          First Flight: {new Date(rocket.first_flight).getFullYear()}
        </span>
        <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
          Mass: {rocket.mass.kg.toLocaleString()} kg
        </span>
      </div>
    </div>
  );
};
