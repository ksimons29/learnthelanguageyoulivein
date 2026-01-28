import { NextRequest } from "next/server";
import { logger, generateRequestId, createRequestLogger } from "./index";

export function getRequestContext(request: NextRequest, userId?: string) {
  const requestId = generateRequestId();
  const log = createRequestLogger(requestId, userId);

  return {
    requestId,
    log,
    logRequest: () => {
      log.info(
        {
          method: request.method,
          url: request.url,
          userAgent: request.headers.get("user-agent"),
        },
        "API request started"
      );
    },
    logResponse: (statusCode: number, durationMs: number) => {
      const level =
        statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
      log[level]({ statusCode, durationMs }, "API request completed");
    },
    logError: (error: unknown, context?: Record<string, unknown>) => {
      log.error(
        {
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  name: error.name,
                  stack: error.stack,
                }
              : String(error),
          ...context,
        },
        "API error occurred"
      );
    },
  };
}

export { logger } from "./index";
