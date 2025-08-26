import React, { useState } from "react";
import LaunchList from "./components/LaunchList";
import LaunchDetails from "./components/LaunchDetails";

const App: React.FC = () => {
  const [selectedLaunchId, setSelectedLaunchId] = useState<string | null>(null);

  return (
    <div>
      <h1>SpaceX Launches</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <LaunchList onSelect={setSelectedLaunchId} />
        <LaunchDetails launchId={selectedLaunchId} />
      </div>
    </div>
  );
};

export default App;