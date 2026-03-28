import { ApplicationError } from "@/shared/application-error";
import type { BuyerProfile } from "@/domain/commercial-upgrade/buyer-profile";
import type { CompanyProfile } from "@/domain/commercial-upgrade/company-profile";

export class UpgradeActivation {
  private constructor(
    private readonly buyerProfile: BuyerProfile,
    private readonly companyProfile: CompanyProfile,
    private readonly submittedAt: string,
    private readonly confirmationCode: string,
  ) {}

  static create(input: {
    buyerProfile: BuyerProfile;
    companyProfile: CompanyProfile;
    submittedAt: string;
    confirmationCode: string;
  }) {
    const normalizedCode = input.confirmationCode.trim();

    if (!normalizedCode) {
      throw new ApplicationError(
        "INVALID_CONFIRMATION_CODE",
        "Confirmation code is required.",
        500,
        "Checkout confirmation is unavailable right now.",
      );
    }

    return new UpgradeActivation(
      input.buyerProfile,
      input.companyProfile,
      input.submittedAt,
      normalizedCode,
    );
  }

  toSummary() {
    return {
      ...this.buyerProfile.toSummary(),
      companyName: this.companyProfile.toSummary().name,
      submittedAt: this.submittedAt,
      confirmationCode: this.confirmationCode,
    };
  }
}
