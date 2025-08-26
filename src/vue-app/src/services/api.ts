import type { Launch } from "@space-x/shared/Launch";
import axios from "axios";

const baseURL = import.meta.env.VITE_SPACEX_API;

console.log(`[Axios] Mode: ${import.meta.env.MODE}`);
console.log(`[Axios] Base URL: ${baseURL}`);

const api = axios.create({
  baseURL,
});

export const fetchLaunches = () => api.get<Launch[]>('/launches');
export const fetchLaunch = (id: string) => api.get<Launch>(`/launches/${id}`);

export default api;