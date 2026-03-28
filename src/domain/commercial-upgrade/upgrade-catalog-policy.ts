import { ApplicationError } from "@/shared/application-error";
import { BillingCycle } from "@/domain/commercial-upgrade/billing-cycle";
import { PlanSelection } from "@/domain/commercial-upgrade/plan-selection";
import { SeatCount } from "@/domain/commercial-upgrade/seat-count";
import type { CommercialPlan, PlanId } from "@/domain/commercial-upgrade/types";

export class UpgradeCatalogPolicy {
  constructor(private readonly catalog: CommercialPlan[]) {}

  createSelection(input: {
    planId: PlanId;
    billingCycle: string;
    seats: number;
  }) {
    const plan = this.catalog.find((candidate) => candidate.planId === input.planId);

    if (!plan) {
      throw new ApplicationError(
        "UNKNOWN_PLAN",
        `Plan ${input.planId} does not exist.`,
        400,
        "Choose a valid plan before continuing.",
      );
    }

    const seatCount = SeatCount.create(input.seats);

    if (seatCount.toValue() < plan.minSeats || seatCount.toValue() > plan.maxSeats) {
      throw new ApplicationError(
        "INVALID_SEAT_COUNT",
        `Seat count ${seatCount.toValue()} is invalid for plan ${plan.planId}.`,
        400,
        `${plan.label} supports between ${plan.minSeats} and ${plan.maxSeats} seats.`,
      );
    }

    return new PlanSelection(
      plan,
      BillingCycle.create(input.billingCycle),
      seatCount,
    );
  }
}
