// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignInPage from "@/app/sign-in/[[...sign-in]]/page";
import SignUpPage from "@/app/sign-up/[[...sign-up]]/page";
import { clerkAuthAppearance } from "@/lib/auth/clerk-auth-appearance";

const signInSpy = vi.fn();
const signUpSpy = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  SignIn: (props: { appearance?: unknown }) => {
    signInSpy(props);
    return <div data-testid="clerk-sign-in" />;
  },
  SignUp: (props: { appearance?: unknown }) => {
    signUpSpy(props);
    return <div data-testid="clerk-sign-up" />;
  },
}));

describe("auth pages", () => {
  beforeEach(() => {
    signInSpy.mockClear();
    signUpSpy.mockClear();
  });

  it("passes the shared neon appearance to the Clerk sign-in surface", () => {
    render(<SignInPage />);

    expect(screen.getByTestId("clerk-sign-in")).toBeInTheDocument();
    expect(signInSpy).toHaveBeenCalledWith(
      expect.objectContaining({ appearance: clerkAuthAppearance }),
    );
  });

  it("passes the shared neon appearance to the Clerk sign-up surface", () => {
    render(<SignUpPage />);

    expect(screen.getByTestId("clerk-sign-up")).toBeInTheDocument();
    expect(signUpSpy).toHaveBeenCalledWith(
      expect.objectContaining({ appearance: clerkAuthAppearance }),
    );
  });
});
