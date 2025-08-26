import axios from "axios";
import type { Launch } from "@space-x/shared/Launch";

const API_URL = import.meta.env.VITE_SPACEX_API;

export const fetchLaunches = async (): Promise<Launch[]> => {
  const { data } = await axios.get<Launch[]>(API_URL);
  return data;
};

export const fetchLaunchById = async (id: string): Promise<Launch> => {
  const { data } = await axios.get<Launch>(`${API_URL}/${id}`);
  return data;
};
