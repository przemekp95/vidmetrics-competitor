import { ApplicationError } from "@/shared/application-error";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export class BuyerProfile {
  private constructor(
    private readonly name: string,
    private readonly email: string,
  ) {}

  static create(input: {
    name: string;
    email: string;
  }) {
    const normalizedName = input.name.trim();
    const normalizedEmail = input.email.trim().toLowerCase();

    if (!normalizedName) {
      throw new ApplicationError(
        "INVALID_BUYER_NAME",
        "Enter the buyer name before submitting checkout.",
        400,
        "Enter the buyer name before submitting checkout.",
      );
    }

    if (!emailPattern.test(normalizedEmail)) {
      throw new ApplicationError(
        "INVALID_BUYER_EMAIL",
        "Enter a valid buyer email before submitting checkout.",
        400,
        "Enter a valid buyer email before submitting checkout.",
      );
    }

    return new BuyerProfile(normalizedName, normalizedEmail);
  }

  toSummary() {
    return {
      name: this.name,
      email: this.email,
    };
  }
}
