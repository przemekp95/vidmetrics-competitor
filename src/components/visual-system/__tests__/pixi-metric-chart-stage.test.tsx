// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@pixi/react", () => ({
  Application: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  extend: vi.fn(),
  useTick: vi.fn(),
}));

vi.mock("pixi.js", () => ({
  Graphics: class Graphics {},
}));

vi.mock("@/components/visual-system/pixi-elements", () => ({
  ensurePixiElements: vi.fn(),
}));

vi.mock("@/lib/use-is-client", () => ({
  useIsClient: () => true,
}));

vi.mock("@/lib/webgl-support", () => ({
  detectWebGLSupport: () => false,
}));

import {
  calculateMetricHitAreas,
  PixiMetricChartStage,
} from "@/components/visual-system/pixi-metric-chart-stage";

describe("PixiMetricChartStage", () => {
  it("renders a static fallback when WebGL is unavailable", () => {
    render(
      <PixiMetricChartStage
        height={240}
        items={[{ id: "mkbhd", label: "MKBHD", value: 10, color: 0x56faff }]}
        testId="metric-stage"
        width={480}
      />,
    );

    expect(screen.getByTestId("metric-stage-fallback")).toBeInTheDocument();
  });

  it("calculates hit areas for DOM overlays", () => {
    expect(calculateMetricHitAreas(300, 200, 3)).toHaveLength(3);
    expect(calculateMetricHitAreas(300, 200, 0)).toEqual([]);
  });
});
