// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { UpgradeCheckoutReadModel } from "@/application/read-models/upgrade-checkout-read-model";
import { UpgradeCheckoutDrawer } from "@/components/upgrade-checkout-drawer";

const checkout: UpgradeCheckoutReadModel = {
  status: "draft",
  planId: "enterprise",
  planLabel: "Enterprise Benchmarking",
  billingCycle: "annual",
  seats: 24,
  displayPrice: "$22,752/yr",
  includedFeatures: [
    "Multi-channel benchmarks",
    "Procurement support",
    "Quarterly strategy reviews",
  ],
  entitlements: [],
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  checkoutSessionId: null,
  checkoutCompletedAt: null,
  lastPaidAt: null,
};

function DrawerHarness(props?: Partial<Parameters<typeof UpgradeCheckoutDrawer>[0]>) {
  const [isOpen, setIsOpen] = useState(false);
  const onStartCheckout = props?.onStartCheckout ?? vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn(() => {
    props?.onClose?.();
    setIsOpen(false);
  });

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Pricing / Upgrade
      </button>
      <UpgradeCheckoutDrawer
        isOpen={isOpen}
        checkout={checkout}
        isStarting={false}
        errorMessage={null}
        {...props}
        onClose={onClose}
        onStartCheckout={onStartCheckout}
      />
    </>
  );
}

describe("UpgradeCheckoutDrawer", () => {
  it("moves focus into the drawer, traps tab navigation, closes on Escape, and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<DrawerHarness onClose={onClose} />);

    const trigger = screen.getByRole("button", { name: /pricing \/ upgrade/i });
    await user.click(trigger);

    const closeButton = await screen.findByRole("button", {
      name: /close upgrade checkout drawer/i,
    });
    expect(closeButton).toHaveFocus();

    const dialog = screen.getByRole("dialog", {
      name: /stripe sandbox subscription/i,
    });
    const focusableElements = [...dialog.querySelectorAll<HTMLElement>("button, a[href], input")]
      .filter((element) => !(element as HTMLButtonElement).disabled);
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    lastFocusable.focus();
    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(lastFocusable).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("exposes dialog description, close button label, and alert semantics for errors", async () => {
    const user = userEvent.setup();

    render(<DrawerHarness errorMessage="Billing failed." />);
    await user.click(screen.getByRole("button", { name: /pricing \/ upgrade/i }));

    const dialog = screen.getByRole("dialog", {
      name: /stripe sandbox subscription/i,
    });
    const describedBy = dialog.getAttribute("aria-describedby");

    expect(describedBy).toContain("upgrade-checkout-description");
    expect(describedBy).toContain("upgrade-checkout-error");
    expect(
      screen.getByRole("button", { name: /close upgrade checkout drawer/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Billing failed.");
  });

  it("submits the selected plan configuration to the start checkout callback", async () => {
    const user = userEvent.setup();
    const onStartCheckout = vi.fn().mockResolvedValue(undefined);

    render(<DrawerHarness onStartCheckout={onStartCheckout} />);

    await user.click(screen.getByRole("button", { name: /pricing \/ upgrade/i }));
    await user.click(screen.getByRole("button", { name: /enterprise benchmarking/i }));
    await user.click(screen.getByRole("button", { name: /continue to configuration/i }));
    await user.click(screen.getByRole("button", { name: /annual/i }));
    await user.clear(screen.getByLabelText(/seats/i));
    await user.type(screen.getByLabelText(/seats/i), "24");
    await user.click(screen.getByRole("button", { name: /continue to stripe sandbox/i }));

    await waitFor(() =>
      expect(onStartCheckout).toHaveBeenCalledWith({
        planId: "enterprise",
        billingCycle: "annual",
        seats: 24,
      }),
    );
  });
});
