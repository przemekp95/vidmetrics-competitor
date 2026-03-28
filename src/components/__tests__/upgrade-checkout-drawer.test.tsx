// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { UpgradeCheckoutReadModel } from "@/application/read-models/upgrade-checkout-read-model";
import { UpgradeCheckoutDrawer } from "@/components/upgrade-checkout-drawer";

const draftCheckout: UpgradeCheckoutReadModel = {
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
  buyerName: null,
  buyerEmail: null,
  companyName: null,
  submittedAt: null,
  confirmationCode: null,
};

const submittedCheckout: UpgradeCheckoutReadModel = {
  ...draftCheckout,
  status: "submitted",
  buyerName: "Alex Rivera",
  buyerEmail: "alex@agency.com",
  companyName: "Northwind Media",
  submittedAt: "2026-03-28T18:00:00.000Z",
  confirmationCode: "VM-20260328-0001",
};

describe("UpgradeCheckoutDrawer", () => {
  it("walks through plan, config, buyer details, and submitted state", async () => {
    const user = userEvent.setup();
    const onStartCheckout = vi.fn().mockResolvedValue(undefined);
    const onConfirmCheckout = vi.fn().mockResolvedValue(undefined);

    const { rerender } = render(
      <UpgradeCheckoutDrawer
        isOpen
        checkout={null}
        isStarting={false}
        isConfirming={false}
        errorMessage={null}
        onClose={vi.fn()}
        onStartCheckout={onStartCheckout}
        onConfirmCheckout={onConfirmCheckout}
      />,
    );

    await user.click(screen.getByRole("button", { name: /enterprise benchmarking/i }));
    await user.click(screen.getByRole("button", { name: /continue to configuration/i }));
    await user.click(screen.getByRole("button", { name: /annual/i }));
    await user.clear(screen.getByLabelText(/seats/i));
    await user.type(screen.getByLabelText(/seats/i), "24");
    await user.click(screen.getByRole("button", { name: /continue to checkout/i }));

    await waitFor(() =>
      expect(onStartCheckout).toHaveBeenCalledWith({
        planId: "enterprise",
        billingCycle: "annual",
        seats: 24,
      }),
    );

    rerender(
      <UpgradeCheckoutDrawer
        isOpen
        checkout={draftCheckout}
        isStarting={false}
        isConfirming={false}
        errorMessage={null}
        onClose={vi.fn()}
        onStartCheckout={onStartCheckout}
        onConfirmCheckout={onConfirmCheckout}
      />,
    );

    await user.type(screen.getByLabelText(/buyer name/i), "Alex Rivera");
    await user.type(screen.getByLabelText(/buyer email/i), "alex@agency.com");
    await user.type(screen.getByLabelText(/^company$/i), "Northwind Media");
    await user.click(screen.getByRole("button", { name: /submit checkout/i }));

    await waitFor(() =>
      expect(onConfirmCheckout).toHaveBeenCalledWith({
        buyerName: "Alex Rivera",
        buyerEmail: "alex@agency.com",
        companyName: "Northwind Media",
      }),
    );

    rerender(
      <UpgradeCheckoutDrawer
        isOpen
        checkout={submittedCheckout}
        isStarting={false}
        isConfirming={false}
        errorMessage={null}
        onClose={vi.fn()}
        onStartCheckout={onStartCheckout}
        onConfirmCheckout={onConfirmCheckout}
      />,
    );

    expect(screen.getByText(/checkout submitted/i)).toBeInTheDocument();
    expect(screen.getByText("VM-20260328-0001")).toBeInTheDocument();
    expect(screen.getByText(/pending activation/i)).toBeInTheDocument();
  }, 15000);
});
