import React from "react";
import type { Ship } from "../types/launchTypes";

interface ShipListProps {
  ships?: Ship[];
}

export const ShipList: React.FC<ShipListProps> = ({ ships }) => {
  if (!ships?.length) return null;

  return (
    <div className="mb-3">
      <h4 className="text-lg font-medium mb-2">Ships</h4>
      <ul className="list-disc list-inside text-gray-700">
        {ships.map((s) => (
          <li key={s.id} className="flex flex-wrap gap-2 items-center">
            <span>{s.name}</span>
            <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
              {s.mass_kg?.toLocaleString() ?? "N/A"} kg
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
