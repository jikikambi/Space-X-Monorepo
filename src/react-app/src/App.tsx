import React from "react";
import "./store/eventListener"; // start listening to SSE events
import { LaunchDashboard } from "./components/LaunchDashboard";

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>SpaceX Launch Dashboard</h1>
      <LaunchDashboard />
    </div>
  );
};

export default App;