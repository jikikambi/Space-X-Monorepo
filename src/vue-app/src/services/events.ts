// import { logger } from "@space-x/shared/logger";

// export async function publishEvent(event: string, payload: any = {}) {
//   try {
//     const response = await fetch("http://localhost:4000/events", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ event, payload }),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to publish event: ${response.statusText}`);
//     }

//     const data = await response.json();
//     logger.info("[Vue] Event published:", data);
//     return data;
//   } catch (err) {
//     logger.error("[Vue] Error publishing event:", err);
//     throw err;
//   }
// }
