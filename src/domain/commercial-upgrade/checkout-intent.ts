import type { BuyerProfile } from "@/domain/commercial-upgrade/buyer-profile";
import type { CompanyProfile } from "@/domain/commercial-upgrade/company-profile";
import type { CheckoutIntentSummary, CheckoutStatus } from "@/domain/commercial-upgrade/types";
import { ApplicationError } from "@/shared/application-error";
import { PlanSelection } from "@/domain/commercial-upgrade/plan-selection";
import { UpgradeActivation } from "@/domain/commercial-upgrade/upgrade-activation";

export class CheckoutIntent {
  private constructor(
    private readonly status: CheckoutStatus,
    private readonly selection: PlanSelection,
    private readonly activation: UpgradeActivation | null,
  ) {}

  static start(selection: PlanSelection) {
    return new CheckoutIntent("draft", selection, null);
  }

  confirm(input: {
    buyerProfile: BuyerProfile;
    companyProfile: CompanyProfile;
    submittedAt: string;
    confirmationCode: string;
  }) {
    if (this.status !== "draft") {
      throw new ApplicationError(
        "CHECKOUT_ALREADY_SUBMITTED",
        "This checkout has already been submitted.",
        409,
        "This checkout has already been submitted.",
      );
    }

    return new CheckoutIntent(
      "submitted",
      this.selection,
      UpgradeActivation.create(input),
    );
  }

  toSummary(): CheckoutIntentSummary {
    const activationSummary = this.activation?.toSummary();

    return {
      status: this.status,
      planId: this.selection.getPlanId(),
      planLabel: this.selection.getPlanLabel(),
      billingCycle: this.selection.getBillingCycle(),
      seats: this.selection.getSeats(),
      displayPrice: this.selection.getDisplayPrice(),
      includedFeatures: this.selection.getIncludedFeatures(),
      buyerName: activationSummary?.name ?? null,
      buyerEmail: activationSummary?.email ?? null,
      companyName: activationSummary?.companyName ?? null,
      submittedAt: activationSummary?.submittedAt ?? null,
      confirmationCode: activationSummary?.confirmationCode ?? null,
    };
  }
}
