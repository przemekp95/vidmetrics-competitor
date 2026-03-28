import { BuyerProfile } from "@/domain/commercial-upgrade/buyer-profile";
import { CompanyProfile } from "@/domain/commercial-upgrade/company-profile";
import type { CheckoutIntentRepository } from "@/ports/checkout-intent-repository";
import { ApplicationError } from "@/shared/application-error";

export function createConfirmUpgradeCheckoutCommandHandler({
  repository,
  now = () => new Date(),
  createConfirmationCode = () =>
    `VM-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.floor(Math.random() * 9000 + 1000)}`,
}: {
  repository: CheckoutIntentRepository;
  now?: () => Date;
  createConfirmationCode?: () => string;
}) {
  return async function handleConfirmUpgradeCheckoutCommand(input: {
    sessionId: string;
    buyerName: string;
    buyerEmail: string;
    companyName: string;
  }) {
    const checkoutIntent = await repository.get(input.sessionId);

    if (!checkoutIntent) {
      throw new ApplicationError(
        "CHECKOUT_NOT_FOUND",
        `Checkout not found for session ${input.sessionId}.`,
        404,
        "Start a checkout before confirming it.",
      );
    }

    const submitted = checkoutIntent.confirm({
      buyerProfile: BuyerProfile.create({
        name: input.buyerName,
        email: input.buyerEmail,
      }),
      companyProfile: CompanyProfile.create({
        name: input.companyName,
      }),
      submittedAt: now().toISOString(),
      confirmationCode: createConfirmationCode(),
    });

    await repository.save(input.sessionId, submitted);

    return submitted;
  };
}
