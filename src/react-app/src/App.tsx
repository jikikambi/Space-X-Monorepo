import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { LaunchDashboard } from "./components/LaunchDashboard";
import type { RootState } from "./store";

const App: React.FC = () => {
  const enrichedLaunchCount = useSelector(
    (state: RootState) => state.launch.enrichedLaunches.length
  );

  const [animate, setAnimate] = useState(false);

  // Trigger animation when enrichedLaunchCount changes
  useEffect(() => {
    if (enrichedLaunchCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [enrichedLaunchCount]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-gray-900 text-white py-6 shadow-md relative">
        <h1 className="text-4xl md:text-5xl font-bold text-center">
          SpaceX Launch Dashboard
        </h1>
        <p className="text-center text-gray-300 mt-1 text-sm md:text-base">
          Live telemetry and launch data powered by SSE
        </p>

        {/* Live event counter badge */}
        <div
          className={`absolute top-4 right-6 flex items-center justify-center bg-red-600 text-white font-semibold text-sm px-3 py-1 rounded-full shadow-lg ${
            animate ? "animate-pulse" : ""
          }`}
        >
          {enrichedLaunchCount}{" "}
          {enrichedLaunchCount === 1 ? "launch" : "launches"}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8">
        <LaunchDashboard />
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-gray-600 py-4 mt-6 border-t border-gray-300 text-center text-sm md:text-base">
        &copy; {new Date().getFullYear()} SpaceX Monorepo Dashboard
      </footer>
    </div>
  );
};

export default App;
