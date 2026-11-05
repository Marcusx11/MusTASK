import { InvalidDateError } from "./errors";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Data de calendário sem hora e sem fuso (ex.: 2026-11-02).
 *
 * Internamente usa UTC só para fazer contas, assim o fuso da máquina
 * nunca desloca o dia.
 */
export class LocalDate {
  private constructor(
    readonly year: number,
    readonly month: number,
    readonly day: number,
  ) {}

  static of(year: number, month: number, day: number): LocalDate {
    const utc = new Date(Date.UTC(year, month - 1, day));
    const valid =
      utc.getUTCFullYear() === year &&
      utc.getUTCMonth() === month - 1 &&
      utc.getUTCDate() === day;
    if (!valid) {
      throw new InvalidDateError(`Data inválida: ${year}-${month}-${day}`);
    }
    return new LocalDate(year, month, day);
  }

  /** Lê o formato ISO "AAAA-MM-DD". */
  static parse(value: string): LocalDate {
    const match = ISO_DATE.exec(value);
    if (!match) {
      throw new InvalidDateError(`Formato de data inválido (esperado AAAA-MM-DD): "${value}"`);
    }
    return LocalDate.of(Number(match[1]), Number(match[2]), Number(match[3]));
  }

  /** Dia da semana ISO: 1 = segunda ... 7 = domingo. */
  get isoDayOfWeek(): number {
    const jsDay = this.toUtc().getUTCDay(); // 0 = domingo
    return jsDay === 0 ? 7 : jsDay;
  }

  plusDays(days: number): LocalDate {
    const utc = new Date(this.toUtc().getTime() + days * MS_PER_DAY);
    return LocalDate.of(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
  }

  /** A segunda-feira da semana (seg→dom) que contém esta data. */
  startOfWeek(): LocalDate {
    return this.plusDays(1 - this.isoDayOfWeek);
  }

  equals(other: LocalDate): boolean {
    return this.toString() === other.toString();
  }

  isAfter(other: LocalDate): boolean {
    return this.toString() > other.toString();
  }

  toString(): string {
    const mm = String(this.month).padStart(2, "0");
    const dd = String(this.day).padStart(2, "0");
    return `${this.year}-${mm}-${dd}`;
  }

  private toUtc(): Date {
    return new Date(Date.UTC(this.year, this.month - 1, this.day));
  }
}
