import React, { useEffect, useState } from "react";
import { fetchLaunches } from "../services/api";
import type { Launch } from "@space-x/shared/Launch";
interface LaunchListProps {
  onSelect: (launchId: string) => void;
}

const LaunchList: React.FC<LaunchListProps> = ({ onSelect }) => {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLaunches()
      .then(setLaunches)
      .catch(() => setError("⚠️ Failed to load launches. Try again later."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-gray-500">Loading launches...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <ul className="space-y-2">
      {launches.map((launch) => (
        <li key={launch.id}>
          <button
            className="w-full px-4 py-2 text-left bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => onSelect(launch.id)}
          >
            {launch.name} ({launch.upcoming ? "🚀 Upcoming" : "✅ Past"})
          </button>
        </li>
      ))}
    </ul>
  );
};

export default LaunchList;
