import type { Launch } from "@space-x/shared/Launch";
import type { Rocket } from "@space-x/shared/Rocket";
import type { Payload } from "@space-x/shared/Payload";
import type { Ship } from "@space-x/shared/Ship";

export type { Launch, Rocket, Payload, Ship };

export interface EnrichedLaunch extends Launch {
  rocketData?: Rocket;
  payloadData?: Payload[];
  shipData?: Ship[];
}

export interface SpaceXEvent {
  event: string;
  payload: any;
}
