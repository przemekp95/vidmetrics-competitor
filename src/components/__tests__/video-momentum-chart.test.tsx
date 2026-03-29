// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CompetitorVideoReadModel } from "@/application/read-models/analysis-read-model";
import { VideoMomentumChart } from "@/components/video-momentum-chart";

let resizeObserverCallback: ResizeObserverCallback | null = null;

vi.mock("@/components/visual-system/pixi-metric-chart-stage", () => ({
  calculateMetricHitAreas: (width: number, height: number, itemCount: number) =>
    Array.from({ length: itemCount }).map((_, index) => ({
      left: index * Math.max(1, width / Math.max(itemCount, 1)),
      width: Math.max(1, width / Math.max(itemCount, 1)),
      top: 24,
      height: Math.max(1, height - 48),
    })),
  PixiMetricChartStage: ({
    height,
    testId,
    width,
  }: {
    height: number;
    testId?: string;
    width: number;
  }) => (
    <div
      data-height={height}
      data-testid={testId}
      data-width={width}
    />
  ),
}));

class ResizeObserverMock {
  constructor(callback: ResizeObserverCallback) {
    resizeObserverCallback = callback;
  }

  disconnect() {}

  observe() {}

  unobserve() {}
}

const sampleVideos: CompetitorVideoReadModel[] = [
  {
    id: "video-1",
    title: "Every iPhone Ever. SAME photo!",
    videoUrl: "https://www.youtube.com/watch?v=example",
    thumbnailUrl: "https://example.com/thumb.jpg",
    publishedAt: "2026-03-27T12:00:00.000Z",
    durationText: "0:46",
    views: 2_162_670,
    likes: 72_000,
    comments: 2_415,
    viewsPerDay: 2_162_670,
    engagementRate: 0.035,
    trend: "hot",
  },
];

describe("VideoMomentumChart", () => {
  beforeEach(() => {
    resizeObserverCallback = null;
    globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
  });

  it("renders the Pixi stage only after the container has positive dimensions", () => {
    render(<VideoMomentumChart videos={sampleVideos} />);

    expect(screen.getByText("Preparing Pixi chart surface...")).toBeInTheDocument();
    expect(screen.queryByTestId("pixi-momentum-stage")).not.toBeInTheDocument();
    expect(resizeObserverCallback).not.toBeNull();

    act(() => {
      resizeObserverCallback?.(
        [
          {
            contentRect: {
              width: 672,
              height: 320,
            },
          } as ResizeObserverEntry,
        ],
        {} as ResizeObserver,
      );
    });

    expect(screen.queryByText("Preparing Pixi chart surface...")).not.toBeInTheDocument();
    expect(screen.getByTestId("pixi-momentum-stage")).toHaveAttribute("data-width", "672");
    expect(screen.getByTestId("pixi-momentum-stage")).toHaveAttribute("data-height", "320");
  });

  it("keeps a readable DOM overlay for the active readout", () => {
    render(<VideoMomentumChart videos={sampleVideos} />);

    expect(screen.getByText("Active readout")).toBeInTheDocument();
    expect(screen.getByText("Every iPhone Ever. SAME photo!")).toBeInTheDocument();
  });
});
