import { ApplicationError } from "@/shared/application-error";

type RateLimitEntry = {
  count: number;
  windowStartedAt: number;
};

type InMemoryAnalyzeRequestGuard = {
  consume: (requesterKey: string) => void;
  runDeduped: <T>(analysisKey: string, operation: () => Promise<T>) => Promise<T>;
};

export function createInMemoryAnalyzeRequestGuard(options?: {
  limit?: number;
  windowMs?: number;
  now?: () => number;
}): InMemoryAnalyzeRequestGuard {
  const limit = options?.limit ?? 10;
  const windowMs = options?.windowMs ?? 5 * 60 * 1000;
  const now = options?.now ?? (() => Date.now());
  const requestCounts = new Map<string, RateLimitEntry>();
  const inflight = new Map<string, Promise<unknown>>();

  return {
    consume(requesterKey) {
      const normalizedRequesterKey = requesterKey.trim().toLowerCase() || "anonymous";
      const currentTime = now();
      const existing = requestCounts.get(normalizedRequesterKey);

      if (!existing || currentTime - existing.windowStartedAt >= windowMs) {
        requestCounts.set(normalizedRequesterKey, {
          count: 1,
          windowStartedAt: currentTime,
        });
        return;
      }

      if (existing.count >= limit) {
        throw new ApplicationError(
          "RATE_LIMIT_EXCEEDED",
          `Too many analysis requests from requester ${normalizedRequesterKey}.`,
          429,
          "Too many analysis requests right now. Please wait a few minutes and try again.",
        );
      }

      existing.count += 1;
    },

    async runDeduped(analysisKey, operation) {
      const normalizedAnalysisKey = analysisKey.trim().toLowerCase();
      const activeOperation = inflight.get(normalizedAnalysisKey);

      if (activeOperation) {
        return activeOperation as Promise<Awaited<ReturnType<typeof operation>>>;
      }

      const nextOperation = operation().finally(() => {
        inflight.delete(normalizedAnalysisKey);
      });

      inflight.set(normalizedAnalysisKey, nextOperation);

      return nextOperation;
    },
  };
}
