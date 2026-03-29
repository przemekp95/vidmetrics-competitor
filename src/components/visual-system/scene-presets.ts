export type ScenePresetName =
  | "workspace"
  | "reports"
  | "tracking"
  | "benchmarks"
  | "checkout_return"
  | "auth"
  | "legal";

export type ScenePreset = {
  name: ScenePresetName;
  palette: {
    base: number;
    accent: number;
    secondary: number;
    glow: number;
  };
  gridOpacity: number;
  waveOpacity: number;
  pulseSpeed: number;
  density: number;
  bloomStrength: number;
};

export const scenePresets: Record<ScenePresetName, ScenePreset> = {
  workspace: {
    name: "workspace",
    palette: {
      base: 0x0b1120,
      accent: 0x27f4ff,
      secondary: 0xff47d4,
      glow: 0x7a5cff,
    },
    gridOpacity: 0.22,
    waveOpacity: 0.42,
    pulseSpeed: 0.92,
    density: 1,
    bloomStrength: 1.2,
  },
  reports: {
    name: "reports",
    palette: {
      base: 0x0d1326,
      accent: 0x6df3ff,
      secondary: 0x6d8dff,
      glow: 0x22d3ee,
    },
    gridOpacity: 0.18,
    waveOpacity: 0.36,
    pulseSpeed: 0.74,
    density: 0.82,
    bloomStrength: 0.92,
  },
  tracking: {
    name: "tracking",
    palette: {
      base: 0x091423,
      accent: 0x00ffc6,
      secondary: 0x2af598,
      glow: 0x08f7fe,
    },
    gridOpacity: 0.18,
    waveOpacity: 0.34,
    pulseSpeed: 0.78,
    density: 0.86,
    bloomStrength: 0.96,
  },
  benchmarks: {
    name: "benchmarks",
    palette: {
      base: 0x0a1023,
      accent: 0xff8bff,
      secondary: 0x66f1ff,
      glow: 0x8c63ff,
    },
    gridOpacity: 0.2,
    waveOpacity: 0.38,
    pulseSpeed: 0.82,
    density: 0.96,
    bloomStrength: 1.08,
  },
  checkout_return: {
    name: "checkout_return",
    palette: {
      base: 0x081120,
      accent: 0x55f0ff,
      secondary: 0xa855f7,
      glow: 0x34d399,
    },
    gridOpacity: 0.16,
    waveOpacity: 0.3,
    pulseSpeed: 0.7,
    density: 0.76,
    bloomStrength: 0.84,
  },
  auth: {
    name: "auth",
    palette: {
      base: 0x090f1c,
      accent: 0x7cf7ff,
      secondary: 0xff73d9,
      glow: 0x4f46e5,
    },
    gridOpacity: 0.12,
    waveOpacity: 0.26,
    pulseSpeed: 0.62,
    density: 0.68,
    bloomStrength: 0.72,
  },
  legal: {
    name: "legal",
    palette: {
      base: 0x0b1020,
      accent: 0x55f0ff,
      secondary: 0x7c3aed,
      glow: 0x94a3ff,
    },
    gridOpacity: 0.1,
    waveOpacity: 0.18,
    pulseSpeed: 0.54,
    density: 0.58,
    bloomStrength: 0.56,
  },
};

export function resolveScenePreset(pathname: string | null | undefined): ScenePresetName {
  if (!pathname || pathname === "/") {
    return "workspace";
  }

  if (pathname.startsWith("/reports")) {
    return "reports";
  }

  if (pathname.startsWith("/tracking")) {
    return "tracking";
  }

  if (pathname.startsWith("/benchmarks")) {
    return "benchmarks";
  }

  if (pathname.startsWith("/checkout/return")) {
    return "checkout_return";
  }

  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return "auth";
  }

  if (
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/copyright") ||
    pathname.startsWith("/accessibility")
  ) {
    return "legal";
  }

  return "workspace";
}
