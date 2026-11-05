import type { LocalDate } from "../../domain/local-date";
import { Week } from "../../domain/week";
import { WeekAlreadyExistsError } from "../errors";
import type { Clock, IdGenerator, WeekRepository } from "../ports";

export class CreateWeek {
  constructor(
    private readonly weeks: WeekRepository,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  /** Cria a semana que contém `date` (ou hoje, se não informada). */
  async execute(input: { date?: LocalDate } = {}): Promise<Week> {
    const date = input.date ?? this.clock.today();
    const week = Week.containing({ id: this.ids.next(), date });

    const existing = await this.weeks.findByMonday(week.monday);
    if (existing) {
      throw new WeekAlreadyExistsError(
        `Já existe uma semana começando em ${week.monday.toString()}.`,
      );
    }

    await this.weeks.save(week);
    return week;
  }
}
