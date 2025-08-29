import { configureStore } from "@reduxjs/toolkit";
import launchReducer from "./slices/launchSlice";

export const store = configureStore({
  reducer: {
    launch: launchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
