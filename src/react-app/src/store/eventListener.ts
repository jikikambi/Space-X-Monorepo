import { eventStream } from "../services/eventStream";
import { store } from "./index";
import { loadRockets, loadShips, loadPayloads } from "./slices/spaceXSlice";
import type { SpaceXEvent } from "./types";
import { logger } from "@space-x/shared/logger";

eventStream.subscribe({
  next: (event: SpaceXEvent) => {
    switch (event.event) {
      case "LOAD_ROCKETS":
        store.dispatch(loadRockets(event.payload));
        break;
      case "LOAD_SHIPS":
        store.dispatch(loadShips(event.payload));
        break;
      case "LOAD_PAYLOADS":
        store.dispatch(loadPayloads(event.payload));
        break;
    }
  },
  error: (err) => logger.error("Event stream error:", err),
});