"use client";

import { useEffect, useRef, useState } from "react";

import {
  PixiMetricChartStage,
  type PixiMetricDatum,
} from "@/components/visual-system/pixi-metric-chart-stage";

function useMeasuredSurface() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const measuredFrame = frame;

    function updateWidth(nextWidth: number) {
      setWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth));
    }

    function readSize() {
      updateWidth(Math.max(0, Math.round(measuredFrame.clientWidth)));
    }

    readSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", readSize);
      return () => window.removeEventListener("resize", readSize);
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      updateWidth(Math.max(0, Math.round(entry?.contentRect.width ?? measuredFrame.clientWidth)));
    });

    resizeObserver.observe(measuredFrame);

    return () => resizeObserver.disconnect();
  }, []);

  return { frameRef, width, isReady: width > 0 };
}

export function ResponsivePixiMetricSurface({
  height,
  items,
  testId,
}: {
  height: number;
  items: PixiMetricDatum[];
  testId?: string;
}) {
  const { frameRef, width, isReady } = useMeasuredSurface();

  return (
    <div
      ref={frameRef}
      className="h-full min-h-[16.5rem] w-full overflow-hidden rounded-[24px] border border-[rgba(86,250,255,0.14)] bg-[rgba(8,15,31,0.68)] p-3"
      data-testid={testId ? `${testId}-frame` : undefined}
    >
      {isReady ? (
        <PixiMetricChartStage
          height={height}
          items={items}
          testId={testId}
          width={Math.max(0, width - 24)}
        />
      ) : (
        <div className="flex h-full items-center justify-center rounded-[18px] border border-dashed border-[rgba(86,250,255,0.18)] text-sm neon-muted-copy">
          Preparing Pixi surface...
        </div>
      )}
    </div>
  );
}
