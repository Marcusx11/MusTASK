import type { Clock } from "../../application/ports";
import type { LocalDate } from "../../domain/local-date";

export class FixedClock implements Clock {
  constructor(private current: LocalDate) {}

  today(): LocalDate {
    return this.current;
  }

  set(date: LocalDate): void {
    this.current = date;
  }
}
