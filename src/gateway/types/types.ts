// -------------------------------
// Event Types
// -------------------------------
export type SpaceXEventType =
  | "LOAD_ROCKETS"
  | "LOAD_SHIPS"
  | "LOAD_PAYLOADS"
  | "ENRICH_LAUNCH"
  | "OTHER_EVENT";

// -------------------------------
// Payload Shapes
// -------------------------------
export interface Rocket {
  id: string;
  name: string;
  [key: string]: any; // fallback for unknown fields
}

export interface Ship {
  id: string;
  name: string;
  [key: string]: any;
}

export interface Payload {
  id: string;
  type: string;
  [key: string]: any;
}

export interface Launch {
  id: string;
  name: string;
  rocket: string;
  payloads: string[];
  ships: string[];
  [key: string]: any;
}

export interface EnrichedLaunchPayload {
  launch: Launch;
  rocket: Rocket | null;
  payloads: Payload[];
  ships: Ship[];
}

// -------------------------------
// Event Interfaces
// -------------------------------
export interface LoadRocketsEvent {
  event: "LOAD_ROCKETS";
  payload: Rocket[];
  source?: string; // optional source
}

export interface LoadShipsEvent {
  event: "LOAD_SHIPS";
  payload: Ship[];
  source?: string;
}

export interface LoadPayloadsEvent {
  event: "LOAD_PAYLOADS";
  payload: Payload[];
  source?: string;
}

export interface EnrichLaunchEvent {
  event: "ENRICH_LAUNCH";
  payload: EnrichedLaunchPayload;
  source?: string;
}

export interface OtherEvent {
  event: "OTHER_EVENT";
  payload: any;
  source?: string;
}

// -------------------------------
// Union of all events
// -------------------------------
export type SpaceXEvent =
  | LoadRocketsEvent
  | LoadShipsEvent
  | LoadPayloadsEvent
  | EnrichLaunchEvent
  | OtherEvent;
