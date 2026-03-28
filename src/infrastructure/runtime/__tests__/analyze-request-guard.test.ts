import { describe, expect, it } from "vitest";

import { createInMemoryAnalyzeRequestGuard } from "@/infrastructure/runtime/in-memory-analyze-request-guard";
import { ApplicationError } from "@/shared/application-error";

describe("createInMemoryAnalyzeRequestGuard", () => {
  it("throws a 429 application error after the requester exceeds the window limit", async () => {
    const guard = createInMemoryAnalyzeRequestGuard({
      limit: 2,
      windowMs: 60_000,
    });

    guard.consume("1.2.3.4");
    guard.consume("1.2.3.4");

    expect(() => guard.consume("1.2.3.4")).toThrowError(ApplicationError);
    expect(() => guard.consume("1.2.3.4")).toThrowError(/Too many analysis requests/i);
  });

  it("deduplicates in-flight analysis requests for the same channel key", async () => {
    const guard = createInMemoryAnalyzeRequestGuard();
    let executions = 0;

    const first = guard.runDeduped("mkbhd", async () => {
      executions += 1;
      await new Promise((resolve) => setTimeout(resolve, 25));
      return { ok: true };
    });
    const second = guard.runDeduped("mkbhd", async () => {
      executions += 1;
      return { ok: true };
    });

    await expect(Promise.all([first, second])).resolves.toEqual([{ ok: true }, { ok: true }]);
    expect(executions).toBe(1);
  });
});
