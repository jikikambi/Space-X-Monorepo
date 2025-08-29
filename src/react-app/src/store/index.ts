import { configureStore } from "@reduxjs/toolkit";
import spaceXReducer from "./slices/spaceXSlice";

export const store = configureStore({
  reducer: {
    spaceX: spaceXReducer,
  },
});

// TypeScript types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;