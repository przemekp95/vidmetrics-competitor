"use client";

import { Application, useTick } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useMemo, useRef } from "react";

import { ensurePixiElements } from "@/components/visual-system/pixi-elements";
import { useIsClient } from "@/lib/use-is-client";
import { detectWebGLSupport } from "@/lib/webgl-support";

export type PixiMetricDatum = {
  id: string;
  label: string;
  value: number;
  color: number;
};

function drawBackgroundGrid(graphics: Graphics, width: number, height: number) {
  graphics.clear();
  graphics.setStrokeStyle({
    color: 0x56faff,
    alpha: 0.08,
    width: 1,
  });

  for (let x = 0; x <= width; x += 72) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, height);
    graphics.stroke();
  }

  for (let y = 0; y <= height; y += 56) {
    graphics.moveTo(0, y);
    graphics.lineTo(width, y);
    graphics.stroke();
  }
}

function drawMetricBars(
  graphics: Graphics,
  input: {
    width: number;
    height: number;
    items: PixiMetricDatum[];
    phase: number;
    hoveredId?: string | null;
  },
) {
  graphics.clear();

  if (input.items.length === 0) {
    return;
  }

  const maxValue = Math.max(...input.items.map((item) => item.value), 1);
  const left = 32;
  const bottom = input.height - 24;
  const usableWidth = input.width - left * 2;
  const slotWidth = usableWidth / input.items.length;
  const barWidth = Math.max(28, slotWidth * 0.46);
  const maxBarHeight = input.height - 92;

  input.items.forEach((item, index) => {
    const intensity = item.id === input.hoveredId ? 1 : input.hoveredId ? 0.52 : 0.86;
    const animatedValue =
      item.value * (0.96 + Math.sin(input.phase * 1.6 + index * 0.8) * 0.04);
    const heightRatio = animatedValue / maxValue;
    const barHeight = Math.max(14, maxBarHeight * heightRatio);
    const x = left + slotWidth * index + (slotWidth - barWidth) / 2;
    const y = bottom - barHeight;

    graphics.setFillStyle({
      color: item.color,
      alpha: 0.14 * intensity,
    });
    graphics.roundRect(x - 10, y - 18, barWidth + 20, barHeight + 18, 22);
    graphics.fill();

    graphics.setFillStyle({
      color: item.color,
      alpha: 0.88 * intensity,
    });
    graphics.roundRect(x, y, barWidth, barHeight, 16);
    graphics.fill();

    graphics.setStrokeStyle({
      color: item.color,
      alpha: 0.48 * intensity,
      width: 1,
    });
    graphics.roundRect(x, y, barWidth, barHeight, 16);
    graphics.stroke();
  });
}

function ChartScene({
  width,
  height,
  items,
  hoveredId,
}: {
  width: number;
  height: number;
  items: PixiMetricDatum[];
  hoveredId?: string | null;
}) {
  const gridRef = useRef<Graphics | null>(null);
  const barsRef = useRef<Graphics | null>(null);
  const phaseRef = useRef(0);

  useTick((ticker) => {
    phaseRef.current += ticker.deltaTime * 0.024;
    if (gridRef.current) {
      drawBackgroundGrid(gridRef.current, width, height);
    }
    if (barsRef.current) {
      drawMetricBars(barsRef.current, {
        width,
        height,
        items,
        phase: phaseRef.current,
        hoveredId,
      });
    }
  });

  return (
    <pixiContainer>
      <pixiGraphics draw={() => undefined} ref={gridRef} />
      <pixiGraphics draw={() => undefined} ref={barsRef} />
    </pixiContainer>
  );
}

export function calculateMetricHitAreas(width: number, height: number, itemCount: number) {
  if (itemCount <= 0) {
    return [];
  }

  const left = 32;
  const usableWidth = width - left * 2;
  const slotWidth = usableWidth / itemCount;
  const barWidth = Math.max(28, slotWidth * 0.46);

  return Array.from({ length: itemCount }).map((_, index) => ({
    left: left + slotWidth * index + (slotWidth - barWidth) / 2,
    width: barWidth,
    top: 24,
    height: height - 48,
  }));
}

export function PixiMetricChartStage({
  width,
  height,
  items,
  hoveredId = null,
  testId,
}: {
  width: number;
  height: number;
  items: PixiMetricDatum[];
  hoveredId?: string | null;
  testId?: string;
}) {
  ensurePixiElements();
  const isClient = useIsClient();
  const canRender = isClient && detectWebGLSupport();
  const preparedItems = useMemo(
    () => items.slice(0, 8),
    [items],
  );

  if (!canRender) {
    return (
      <div
        className="h-full w-full rounded-[28px] border border-[rgba(86,250,255,0.18)] bg-[linear-gradient(180deg,rgba(8,15,31,0.72),rgba(8,15,31,0.52))]"
        data-testid={testId ? `${testId}-fallback` : undefined}
      />
    );
  }

  return (
    <Application
      antialias
      autoDensity
      backgroundAlpha={0}
      height={height}
      width={width}
    >
      <ChartScene
        height={height}
        hoveredId={hoveredId}
        items={preparedItems}
        width={width}
      />
    </Application>
  );
}
