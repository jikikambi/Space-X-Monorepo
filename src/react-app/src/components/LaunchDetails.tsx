import React, { useEffect, useState } from "react";
import { fetchLaunchById } from "../services/api";
import type { Launch } from "@space-x/shared/Launch";

interface LaunchDetailsProps {
  launchId: string | null;
}

const LaunchDetails: React.FC<LaunchDetailsProps> = ({ launchId }) => {
  const [launch, setLaunch] = useState<Launch | null>(null);

  useEffect(() => {
    if (!launchId) return;
    fetchLaunchById(launchId).then(setLaunch);
  }, [launchId]);

  if (!launch) return <div>Select a launch to see details</div>;

  return (
    <div>
      <h2>{launch.name}</h2>
      <p>Date: {new Date(launch.date_utc).toLocaleString()}</p>
      <p>Status: {launch.upcoming ? "Upcoming" : launch.success ? "Success" : "Failed"}</p>
      <p>{launch.details || "No details available"}</p>
    </div>
  );
};

export default LaunchDetails;