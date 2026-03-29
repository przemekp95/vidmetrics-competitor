"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { CompetitorVideoReadModel } from "@/application/read-models/analysis-read-model";
import {
  calculateMetricHitAreas,
  PixiMetricChartStage,
  type PixiMetricDatum,
} from "@/components/visual-system/pixi-metric-chart-stage";
import { formatCompactNumber, formatPercent } from "@/lib/formatters";

const trendColors: Record<CompetitorVideoReadModel["trend"], number> = {
  hot: 0x56faff,
  above_avg: 0xff63d8,
  steady: 0x8c63ff,
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
      updateDimensions(
        Math.max(0, Math.round(measuredFrame.clientWidth)),
        Math.max(0, Math.round(measuredFrame.clientHeight)),
      );
    }

    readFrameSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", readFrameSize);
      return () => window.removeEventListener("resize", readFrameSize);
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
    return () => resizeObserver.disconnect();
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const chartData = useMemo(
    () =>
      videos.slice(0, 6).map((video) => ({
        id: video.id,
        label: video.title.length > 28 ? `${video.title.slice(0, 28)}...` : video.title,
        value: video.viewsPerDay,
        color: trendColors[video.trend],
        source: video,
      })),
    [videos],
  );
  const hoveredVideo =
    chartData.find((item) => item.id === hoveredId)?.source ?? chartData[0]?.source ?? null;
  const hitAreas = useMemo(
    () => calculateMetricHitAreas(chartWidth, chartHeight, chartData.length),
    [chartData.length, chartHeight, chartWidth],
  );
  const pixiItems = useMemo<PixiMetricDatum[]>(
    () =>
      chartData.map((item) => ({
        id: item.id,
        label: item.label,
        value: item.value,
        color: item.color,
      })),
    [chartData],
  );

  if (chartData.length === 0) {
    return (
      <section className="neon-panel rounded-[34px] p-8">
        <p className="eyebrow">Momentum surface</p>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight neon-title">
          Velocity scene is standing by
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 neon-muted-copy">
          Once a channel has current-window uploads, this surface switches into a Pixi-rendered
          velocity chart to show who is accelerating fastest right now.
        </p>
      </section>
    );
  }

  return (
    <section className="neon-panel neon-grid rounded-[34px] p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="eyebrow">Momentum surface</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight neon-title">
            Velocity leaders in motion
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 neon-muted-copy">
            Pixi renders the geometry. The overlay keeps tooltips and labels crisp so the chart
            stays usable during live comparisons.
          </p>
        </div>

        {hoveredVideo ? (
          <div className="neon-shell-soft rounded-[28px] px-5 py-4 xl:max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">
              Active readout
            </p>
            <p className="mt-3 text-lg font-semibold leading-6 text-(--color-foreground)">
              {hoveredVideo.title}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="neon-muted-copy">Velocity</p>
                <p className="mt-1 font-semibold text-(--color-foreground)">
                  {formatCompactNumber(hoveredVideo.viewsPerDay)}/day
                </p>
              </div>
              <div>
                <p className="neon-muted-copy">Engagement</p>
                <p className="mt-1 font-semibold text-(--color-foreground)">
                  {formatPercent(hoveredVideo.engagementRate)}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div
        ref={frameRef}
        className="relative mt-6 h-[26rem] overflow-hidden rounded-[30px] border border-[rgba(86,250,255,0.14)] bg-[linear-gradient(180deg,rgba(4,9,20,0.86),rgba(8,15,31,0.56))]"
        data-testid="video-momentum-chart-frame"
      >
        {isReady ? (
          <>
            <div className="absolute inset-0">
              <PixiMetricChartStage
                height={chartHeight}
                hoveredId={hoveredId}
                items={pixiItems}
                testId="pixi-momentum-stage"
                width={chartWidth}
              />
            </div>

            {hitAreas.map((area, index) => (
              <button
                key={chartData[index]?.id}
                type="button"
                aria-label={`Inspect ${chartData[index]?.label}`}
                className="absolute top-0 block rounded-[18px] bg-transparent outline-none"
                onBlur={() => setHoveredId((current) => (current === chartData[index]?.id ? null : current))}
                onFocus={() => setHoveredId(chartData[index]?.id ?? null)}
                onMouseEnter={() => setHoveredId(chartData[index]?.id ?? null)}
                onMouseLeave={() => setHoveredId((current) => (current === chartData[index]?.id ? null : current))}
                style={{
                  left: `${area.left}px`,
                  top: `${area.top}px`,
                  width: `${area.width}px`,
                  height: `${area.height}px`,
                }}
              >
                <span className="sr-only">{chartData[index]?.label}</span>
              </button>
            ))}

            <div className="pointer-events-none absolute inset-x-5 bottom-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${chartData.length}, minmax(0, 1fr))` }}>
              {chartData.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border px-3 py-2 text-center transition ${
                    item.id === hoveredId
                      ? "border-[rgba(86,250,255,0.4)] bg-[rgba(86,250,255,0.12)]"
                      : "border-[rgba(112,132,191,0.14)] bg-[rgba(8,15,31,0.46)]"
                  }`}
                >
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-(--color-muted)">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-[rgba(86,250,255,0.24)] bg-[rgba(8,15,31,0.62)] text-sm text-(--color-muted)">
            Preparing Pixi chart surface...
          </div>
        )}
      </div>
    </section>
  );
}
