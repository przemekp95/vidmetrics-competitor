import { ApplicationError } from "@/shared/application-error";

export class CompanyProfile {
  private constructor(private readonly name: string) {}

  static create(input: { name: string }) {
    const normalizedName = input.name.trim();

    if (!normalizedName) {
      throw new ApplicationError(
        "INVALID_COMPANY_NAME",
        "Enter the company name before submitting checkout.",
        400,
        "Enter the company name before submitting checkout.",
      );
    }

    return new CompanyProfile(normalizedName);
  }

  toSummary() {
    return {
      name: this.name,
    };
  }
}
