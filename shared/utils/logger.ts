
import pino from "pino";

type LogLevel = "info" | "warn" | "error" | "debug";

// Use Vite env flag
const isProd =process.env.NODE_ENV === "production";

// Configure pino
const pinoLogger = pino({
  level: isProd ? "info" : "debug", 
  transport: !isProd ? { target: "pino-pretty", options: { colorize: true } } : undefined, 
});

// Wrapper to keep the same shape
function log(level: LogLevel, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const payload = { timestamp, message, data };

  // Map warn → warn, rest are same
  switch (level) {
    case "info":
      pinoLogger.info(payload);
      break;
    case "warn":
      pinoLogger.warn(payload);
      break;
    case "error":
      pinoLogger.error(payload);
      break;
    case "debug":
      if (!isProd) pinoLogger.debug(payload); 
      break;
  }
}

export const logger = {
  info: (msg: string, data?: unknown) => log("info", msg, data),
  warn: (msg: string, data?: unknown) => log("warn", msg, data),
  error: (msg: string, data?: unknown) => log("error", msg, data),
  debug: (msg: string, data?: unknown) => log("debug", msg, data),
};
