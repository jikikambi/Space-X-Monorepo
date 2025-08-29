import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SpaceXState } from "../types";

const initialState: SpaceXState = {
  rockets: [],
  ships: [],
  payloads: [],
};

const spaceXSlice = createSlice({
  name: "spaceX",
  initialState,
  reducers: {
    loadRockets(state, action: PayloadAction<any[]>) {
      state.rockets = action.payload;
    },
    loadShips(state, action: PayloadAction<any[]>) {
      state.ships = action.payload;
    },
    loadPayloads(state, action: PayloadAction<any[]>) {
      state.payloads = action.payload;
    },
  },
});

export const { loadRockets, loadShips, loadPayloads } = spaceXSlice.actions;
export default spaceXSlice.reducer;
