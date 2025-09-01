import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const SPACEX_API = process.env.SPACEX_API!;
if (!SPACEX_API) throw new Error("SPACEX_API is not defined");

export async function fetchLaunch(id: string) {
  const res = await axios.get(`${SPACEX_API}/${id}`);
  return res.data;
}

export async function fetchRocket(rocketId: string) {
  if (!rocketId) return null;
  const res = await axios.get(`${SPACEX_API.replace("/launches", "/rockets")}/${rocketId}`);
  return res.data;
}

export async function fetchPayloads(payloadIds: string[]) {
  if (!payloadIds?.length) return [];
  return Promise.all(
    payloadIds.map(id => axios.get(`${SPACEX_API.replace("/launches", "/payloads")}/${id}`).then(r => r.data))
  );
}

export async function fetchShips(shipIds: string[]) {
  if (!shipIds?.length) return [];
  return Promise.all(
    shipIds.map(id => axios.get(`${SPACEX_API.replace("/launches", "/ships")}/${id}`).then(r => r.data))
  );
}