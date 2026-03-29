"use client";

import { Application, useTick } from "@pixi/react";
import { BlurFilter, Graphics } from "pixi.js";
import { GlowFilter } from "pixi-filters";
import { usePathname } from "next/navigation";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ensurePixiElements } from "@/components/visual-system/pixi-elements";
import {
  resolveScenePreset,
  scenePresets,
  type ScenePreset,
} from "@/components/visual-system/scene-presets";
import { detectWebGLSupport } from "@/lib/webgl-support";

type VisualStageState = "ready" | "fallback";

class VisualStageBoundary extends Component<
  {
    fallback: ReactNode;
    children: ReactNode;
    onError: () => void;
  },
  { hasError: boolean }
> {
  constructor(props: { fallback: ReactNode; children: ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    void error;
    void errorInfo;
    this.props.onError();
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function drawSceneLayer(graphics: Graphics, preset: ScenePreset, phase: number) {
  graphics.clear();

  const blur = new BlurFilter({
    strength: 28 * preset.bloomStrength,
    quality: 6,
  });
  const glow = new GlowFilter({
    distance: 32 * preset.bloomStrength,
    outerStrength: 1.05 * preset.bloomStrength,
    innerStrength: 0.12,
    color: preset.palette.glow,
    quality: 0.24,
  });
  graphics.filters = [blur, glow];

  const orbConfigs = [
    { x: 0.17, y: 0.18, radius: 280, color: preset.palette.accent, alpha: 0.18 },
    { x: 0.82, y: 0.22, radius: 240, color: preset.palette.secondary, alpha: 0.14 },
    { x: 0.72, y: 0.74, radius: 320, color: preset.palette.glow, alpha: 0.16 },
  ];

  orbConfigs.forEach((orb, index) => {
    const drift = Math.sin(phase * preset.pulseSpeed + index * 1.6) * 24;
    graphics.setFillStyle({ color: orb.color, alpha: orb.alpha });
    graphics.circle(orb.x * 1920 + drift, orb.y * 1080 - drift, orb.radius);
    graphics.fill();
  });
}

function drawGridLayer(graphics: Graphics, preset: ScenePreset, phase: number) {
  graphics.clear();
  graphics.filters = [];
  graphics.setStrokeStyle({
    color: preset.palette.accent,
    alpha: preset.gridOpacity,
    width: 1,
  });

  const width = 1920;
  const height = 1080;
  const spacing = 100 / preset.density;

  for (let x = -width; x <= width * 2; x += spacing) {
    const offset = Math.sin(phase * 0.4 + x * 0.003) * 12;
    graphics.moveTo(x + offset, 0);
    graphics.lineTo(x - offset, height);
    graphics.stroke();
  }

  graphics.setStrokeStyle({
    color: preset.palette.secondary,
    alpha: preset.gridOpacity * 0.7,
    width: 1,
  });

  for (let y = -height; y <= height * 2; y += spacing) {
    const offset = Math.cos(phase * 0.35 + y * 0.004) * 18;
    graphics.moveTo(0, y + offset);
    graphics.lineTo(width, y - offset);
    graphics.stroke();
  }
}

function drawWaveLayer(graphics: Graphics, preset: ScenePreset, phase: number) {
  graphics.clear();
  graphics.filters = [new BlurFilter({ strength: 4, quality: 2 })];

  const width = 1920;
  const lines = [
    { y: 230, amplitude: 36, color: preset.palette.accent },
    { y: 500, amplitude: 42, color: preset.palette.secondary },
    { y: 780, amplitude: 30, color: preset.palette.glow },
  ];

  lines.forEach((line, index) => {
    graphics.setStrokeStyle({
      color: line.color,
      alpha: preset.waveOpacity - index * 0.07,
      width: 2 + index,
    });
    graphics.moveTo(-80, line.y);

    for (let x = -80; x <= width + 80; x += 48) {
      const y =
        line.y +
        Math.sin(phase * (0.9 + index * 0.14) + x * 0.006) * line.amplitude +
        Math.cos(phase * 0.28 + x * 0.0025) * 10;
      graphics.lineTo(x, y);
    }

    graphics.stroke();
  });
}

function SceneCanvas({ preset }: { preset: ScenePreset }) {
  const gridRef = useRef<Graphics | null>(null);
  const waveRef = useRef<Graphics | null>(null);
  const glowRef = useRef<Graphics | null>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    drawGridLayer(gridRef.current ?? new Graphics(), preset, phaseRef.current);
    drawWaveLayer(waveRef.current ?? new Graphics(), preset, phaseRef.current);
    drawSceneLayer(glowRef.current ?? new Graphics(), preset, phaseRef.current);
  }, [preset]);

  useTick((ticker) => {
    phaseRef.current += ticker.deltaTime * 0.022;
    if (gridRef.current) {
      drawGridLayer(gridRef.current, preset, phaseRef.current);
    }
    if (waveRef.current) {
      drawWaveLayer(waveRef.current, preset, phaseRef.current);
    }
    if (glowRef.current) {
      drawSceneLayer(glowRef.current, preset, phaseRef.current);
    }
  });

  return (
    <pixiContainer>
      <pixiGraphics draw={() => undefined} ref={glowRef} />
      <pixiGraphics draw={() => undefined} ref={gridRef} />
      <pixiGraphics draw={() => undefined} ref={waveRef} />
    </pixiContainer>
  );
}

export function VisualStage() {
  ensurePixiElements();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<VisualStageState>(() =>
    detectWebGLSupport() ? "ready" : "fallback",
  );
  const preset = useMemo(
    () => scenePresets[resolveScenePreset(pathname)],
    [pathname],
  );

  const baseClassName =
    "pointer-events-none fixed inset-0 z-0 overflow-hidden [mask-image:radial-gradient(circle_at_center,black,transparent_92%)]";

  if (state === "fallback") {
    return (
      <div
        aria-hidden
        className={`${baseClassName} bg-[radial-gradient(circle_at_top_left,rgba(39,244,255,0.18),transparent_28%),radial-gradient(circle_at_78%_16%,rgba(255,71,212,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(122,92,255,0.18),transparent_30%)]`}
        data-testid="visual-stage-fallback"
      />
    );
  }

  return (
    <div
      aria-hidden
      className={baseClassName}
      data-testid="visual-stage"
      ref={containerRef}
    >
      <VisualStageBoundary
        fallback={<div aria-hidden className="absolute inset-0" data-testid="visual-stage-fallback" />}
        onError={() => setState("fallback")}
      >
        <Application
          autoDensity
          antialias
          backgroundAlpha={0}
          defaultTextStyle={{ fill: "#f7fbff" }}
          preference="webgl"
          resolution={typeof window !== "undefined" ? window.devicePixelRatio : 1}
          resizeTo={containerRef}
        >
          <SceneCanvas preset={preset} />
        </Application>
      </VisualStageBoundary>
    </div>
  );
}
