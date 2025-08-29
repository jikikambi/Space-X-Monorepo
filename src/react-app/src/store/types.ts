export interface SpaceXState {
  rockets: any[];
  ships: any[];
  payloads: any[];
}

export type SpaceXEventType = 
  | "LOAD_ROCKETS"
  | "LOAD_SHIPS"
  | "LOAD_PAYLOADS";

export interface SpaceXEvent {
  event: SpaceXEventType;
  payload: any[];
}
