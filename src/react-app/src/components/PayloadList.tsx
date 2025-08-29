import React from "react";
import type { Payload } from "../types/launchTypes";

interface PayloadListProps {
  payloads?: Payload[];
}

export const PayloadList: React.FC<PayloadListProps> = ({ payloads }) => {
  if (!payloads?.length) return null;

  return (
    <div className="mb-3">
      <h4 className="text-lg font-medium mb-2">Payloads</h4>
      <ul className="list-disc list-inside text-gray-700">
        {payloads.map((p) => (
          <li key={p.id} className="flex flex-wrap gap-2 items-center">
            <span>{p.name} ({p.type})</span>
            <span className="text-sm bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              {p.mass_kg ?? "N/A"} kg
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
