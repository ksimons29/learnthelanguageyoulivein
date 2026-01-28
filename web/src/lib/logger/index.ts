import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: {
    service: "llyli-web",
    env: process.env.NODE_ENV,
  },
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "HH:MM:ss",
          },
        }
      : undefined,
  redact: ["req.headers.authorization", "req.headers.cookie"],
});

export function createRequestLogger(requestId: string, userId?: string) {
  return logger.child({ requestId, userId: userId || "anonymous" });
}

export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export type Logger = typeof logger;
