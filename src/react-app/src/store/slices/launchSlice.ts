import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Launch } from "@space-x/shared/Launch";
import type { Rocket } from "@space-x/shared/Rocket";
import type { Payload } from "@space-x/shared/Payload";
import type { Ship } from "@space-x/shared/Ship";

interface EnrichedLaunch extends Launch {
  rocketData?: Rocket;
  payloadData?: Payload[];
  shipData?: Ship[];
}

interface LaunchState {
  enrichedLaunches: EnrichedLaunch[];
}

const initialState: LaunchState = {
  enrichedLaunches: [],
};

export const launchSlice = createSlice({
  name: "launch",
  initialState,
  reducers: {
    addEnrichedLaunch: (state, action: PayloadAction<EnrichedLaunch>) => {
      const exists = state.enrichedLaunches.find((l) => l.id === action.payload.id);
      if (!exists) {
        state.enrichedLaunches.push(action.payload);
      } else {
        // Update existing launch if new enrichment arrives
        Object.assign(exists, action.payload);
      }
    },
    resetLaunches: (state) => {
      state.enrichedLaunches = [];
    },
  },
});

export const { addEnrichedLaunch, resetLaunches } = launchSlice.actions;
export default launchSlice.reducer;
export type { EnrichedLaunch };
