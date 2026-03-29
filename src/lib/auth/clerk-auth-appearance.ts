import type { ComponentProps } from "react";

import { SignIn } from "@clerk/nextjs";

export const clerkAuthAppearance: ComponentProps<typeof SignIn>["appearance"] = {
  variables: {
    colorBackground: "#08101f",
    colorInputBackground: "#08101f",
    colorInputText: "#f6fbff",
    colorText: "#f6fbff",
    colorTextSecondary: "#8ea0c9",
    colorPrimary: "#56faff",
    colorDanger: "#ff8eb0",
    borderRadius: "1rem",
    fontFamily: "var(--font-space-grotesk)",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full",
    card: "!bg-transparent !shadow-none !border-0",
    headerTitle: "!text-[color:var(--color-foreground)]",
    headerSubtitle: "!text-[color:var(--color-muted)]",
    socialButtonsBlockButton:
      "neon-button-outline !h-12 !rounded-2xl !border-[rgba(86,250,255,0.22)] !bg-[rgba(8,15,31,0.82)] !text-[color:var(--color-foreground)]",
    socialButtonsBlockButtonText: "!text-[color:var(--color-foreground)]",
    formFieldLabel: "!text-[color:var(--color-muted)]",
    formFieldInput:
      "neon-field !h-12 !rounded-2xl !border-[rgba(86,250,255,0.22)] !bg-[rgba(8,15,31,0.84)] !text-[color:var(--color-foreground)] placeholder:!text-[color:var(--color-muted)]",
    formFieldInputShowPasswordButton:
      "!text-[color:var(--color-muted)] hover:!text-[color:var(--color-foreground)]",
    formButtonPrimary:
      "neon-button !h-12 !rounded-2xl !text-[color:var(--color-foreground)]",
    footerActionText: "!text-[color:var(--color-muted)]",
    footerActionLink: "neon-link !text-[color:var(--color-accent)]",
    dividerLine: "!bg-[rgba(112,132,191,0.22)]",
    dividerText: "!bg-transparent !text-[color:var(--color-muted)]",
    formResendCodeLink: "neon-link !text-[color:var(--color-accent)]",
    otpCodeFieldInput:
      "neon-field !rounded-2xl !bg-[rgba(8,15,31,0.84)] !text-[color:var(--color-foreground)]",
    identityPreviewText: "!text-[color:var(--color-foreground)]",
    identityPreviewEditButton: "neon-link !text-[color:var(--color-accent)]",
    alternativeMethodsBlockButton:
      "neon-button-outline !rounded-2xl !text-[color:var(--color-foreground)]",
    alert:
      "!border !border-[rgba(255,107,147,0.26)] !bg-[rgba(44,11,27,0.82)]",
    alertText: "!text-[#ff8eb0]",
    formFieldWarningText: "!text-[#ff8eb0]",
    formFieldSuccessText: "!text-[#7fffe3]",
    footer: "!bg-transparent",
    footerPagesLink: "neon-link !text-[color:var(--color-accent)]",
    navbar: "!hidden",
  },
};
