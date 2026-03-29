import { describe, expect, it } from "vitest";

import { resolveScenePreset } from "@/components/visual-system/scene-presets";

describe("resolveScenePreset", () => {
  it("maps the primary app routes to the expected scene presets", () => {
    expect(resolveScenePreset("/")).toBe("workspace");
    expect(resolveScenePreset("/reports")).toBe("reports");
    expect(resolveScenePreset("/tracking")).toBe("tracking");
    expect(resolveScenePreset("/benchmarks")).toBe("benchmarks");
    expect(resolveScenePreset("/checkout/return")).toBe("checkout_return");
    expect(resolveScenePreset("/sign-in")).toBe("auth");
    expect(resolveScenePreset("/privacy")).toBe("legal");
  });

  it("falls back to the workspace preset for unknown paths", () => {
    expect(resolveScenePreset("/some-future-route")).toBe("workspace");
    expect(resolveScenePreset(undefined)).toBe("workspace");
  });
});
