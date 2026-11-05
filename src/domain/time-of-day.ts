import { InvalidTimeError } from "./errors";

const HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Horário do dia sem data e sem fuso, no formato "HH:MM" (00:00–23:59). */
export class TimeOfDay {
  private constructor(
    readonly hour: number,
    readonly minute: number,
  ) {}

  static parse(value: string): TimeOfDay {
    const match = HH_MM.exec(value);
    if (!match) {
      throw new InvalidTimeError(`Horário inválido (esperado HH:MM): "${value}"`);
    }
    return new TimeOfDay(Number(match[1]), Number(match[2]));
  }

  toString(): string {
    return `${String(this.hour).padStart(2, "0")}:${String(this.minute).padStart(2, "0")}`;
  }
}
