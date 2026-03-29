"use client";

import dynamic from "next/dynamic";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

const ClientVisualStage = dynamic(
  () =>
    import("@/components/visual-system/visual-stage").then((module) => ({
      default: module.VisualStage,
    })),
  {
    ssr: false,
  },
);

export function VisualRoot({
  children,
  ...props
}: ComponentPropsWithoutRef<"div"> & { children: ReactNode }) {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-[color:var(--color-background)]"
      data-app-visual-root
      {...props}
    >
      <ClientVisualStage />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
