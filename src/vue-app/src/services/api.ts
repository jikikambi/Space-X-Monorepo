import type { Launch } from "@space-x/shared/Launch";
import axios from "axios";

const baseURL = import.meta.env.VITE_SPACEX_API;

console.log(`[Axios] Mode: ${import.meta.env.MODE}`);
console.log(`[Axios] Base URL: ${baseURL}`);

const api = axios.create({
  baseURL,
});

// Fetch all launches
export const fetchLaunches = () => api.get<Launch[]>('/launches');
// Fetch single launch
export const fetchLaunch = (id: string) => api.get<Launch>(`/launches/${id}`);
// Fetch rocket details (launch.rocket is just an ID)
export const fetchRocket = (rocket: string) => api.get(`/rockets/${rocket}`);
// Fetch launchpad details (launch.launchpad is just an ID)
export const fetchLaunchpad = (launchpad: string) => api.get(`/launchpads/${launchpad}`);

export default api;