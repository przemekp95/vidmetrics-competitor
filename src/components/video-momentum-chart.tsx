"use client";

import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from "recharts";

import type { CompetitorVideoReadModel } from "@/application/read-models/analysis-read-model";
import { formatCompactNumber } from "@/lib/formatters";

const trendColors: Record<CompetitorVideoReadModel["trend"], string> = {
  hot: "var(--color-accent)",
  above_avg: "var(--color-sun)",
  steady: "var(--color-foreground-soft)",
};

function useMeasuredChartFrame() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const measuredFrame = frame;

    function updateDimensions(width: number, height: number) {
      setDimensions((current) => {
        if (current.width === width && current.height === height) {
          return current;
        }

        return { width, height };
      });
    }

    function readFrameSize() {
      const nextWidth = Math.max(0, Math.round(measuredFrame.clientWidth));
      const nextHeight = Math.max(0, Math.round(measuredFrame.clientHeight));

      updateDimensions(nextWidth, nextHeight);
    }

    readFrameSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", readFrameSize);

      return () => {
        window.removeEventListener("resize", readFrameSize);
      };
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        readFrameSize();
        return;
      }

      updateDimensions(
        Math.max(0, Math.round(entry.contentRect.width)),
        Math.max(0, Math.round(entry.contentRect.height)),
      );
    });

    resizeObserver.observe(measuredFrame);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return {
    frameRef,
    chartHeight: dimensions.height,
    chartWidth: dimensions.width,
    isReady: dimensions.width > 0 && dimensions.height > 0,
  };
}

export function VideoMomentumChart({
  videos,
}: {
  videos: CompetitorVideoReadModel[];
}) {
  const { frameRef, chartWidth, chartHeight, isReady } = useMeasuredChartFrame();
  const chartData = videos.slice(0, 6).map((video) => ({
    id: video.id,
    title: video.title.length > 24 ? `${video.title.slice(0, 24)}...` : video.title,
    viewsPerDay: video.viewsPerDay,
    trend: video.trend,
  }));

  if (chartData.length === 0) {
    return (
      <section className="rounded-[32px] border border-dashed border-[color:var(--color-border)] bg-white/70 p-8">
        <h2 className="text-xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
          Momentum snapshot
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[color:var(--color-muted)]">
          Once a channel has uploads in the active month, this chart highlights which videos are
          accelerating fastest on public view velocity.
        </p>
      </section>
    );
  }

  return (
    <section className="min-w-0 rounded-[32px] border border-[color:var(--color-border)] bg-white/90 p-6 shadow-[0_18px_50px_rgba(31,35,33,0.07)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Momentum chart
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            View velocity leaders
          </h2>
        </div>
        <p className="max-w-xs text-right text-sm leading-6 text-[color:var(--color-muted)]">
          Ranked by views per day from currently public metrics.
        </p>
      </div>

      <div ref={frameRef} data-testid="video-momentum-chart-frame" className="mt-6 h-80 min-w-0">
        {isReady ? (
          <BarChart
            width={chartWidth}
            height={chartHeight}
            data={chartData}
            margin={{ left: 0, right: 12, top: 6, bottom: 8 }}
          >
            <CartesianGrid stroke="rgba(109, 116, 106, 0.14)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="title"
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tickFormatter={(value) => formatCompactNumber(Number(value))}
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <Tooltip
              cursor={{ fill: "rgba(16, 120, 105, 0.08)" }}
              contentStyle={{
                borderRadius: 20,
                border: "1px solid rgba(216, 208, 194, 1)",
                background: "rgba(255, 252, 246, 0.98)",
                boxShadow: "0 16px 36px rgba(31, 35, 33, 0.12)",
              }}
              formatter={(value) => [
                `${formatCompactNumber(Number(value ?? 0))}/day`,
                "View velocity",
              ]}
            />
            <Bar dataKey="viewsPerDay" radius={[14, 14, 6, 6]}>
              {chartData.map((entry) => (
                <Cell key={entry.id} fill={trendColors[entry.trend]} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-[color:var(--color-border)] bg-[rgba(255,252,246,0.7)] text-sm text-[color:var(--color-muted)]">
            Preparing chart...
          </div>
        )}
      </div>
    </section>
  );
}
