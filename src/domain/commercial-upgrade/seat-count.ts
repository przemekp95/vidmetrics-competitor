import { ApplicationError } from "@/shared/application-error";

export class SeatCount {
  private constructor(private readonly value: number) {}

  static create(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > 250) {
      throw new ApplicationError(
        "INVALID_SEAT_COUNT",
        `Seat count ${value} is outside the supported range.`,
        400,
        "Choose a seat count between 1 and 250.",
      );
    }

    return new SeatCount(value);
  }

  toValue() {
    return this.value;
  }
}
