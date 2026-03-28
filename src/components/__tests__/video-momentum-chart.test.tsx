// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import type { ReactNode } from "react";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CompetitorVideoReadModel } from "@/application/read-models/analysis-read-model";
import { VideoMomentumChart } from "@/components/video-momentum-chart";

let resizeObserverCallback: ResizeObserverCallback | null = null;

vi.mock("recharts", () => ({
  BarChart: ({
    children,
    height,
    width,
  }: {
    children: ReactNode;
    height: number;
    width: number;
  }) => (
    <div data-height={height} data-testid="bar-chart" data-width={width}>
      {children}
    </div>
  ),
  Bar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null,
  Cell: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
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

  it("renders the chart only after the container has positive dimensions", () => {
    render(<VideoMomentumChart videos={sampleVideos} />);

    expect(screen.getByText("Preparing chart...")).toBeInTheDocument();
    expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
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

    expect(screen.queryByText("Preparing chart...")).not.toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toHaveAttribute("data-width", "672");
    expect(screen.getByTestId("bar-chart")).toHaveAttribute("data-height", "320");
  });
});
