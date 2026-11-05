import { Period } from "../../domain/period";
import type { IdGenerator, PeriodRepository } from "../ports";

/** Cria um período no fim da ordem atual (posição = total + 1). */
export class CreatePeriod {
  constructor(
    private readonly periods: PeriodRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: { name: string }): Promise<Period> {
    const existing = await this.periods.findAll();
    const period = Period.create({
      id: this.ids.next(),
      name: input.name,
      position: existing.length + 1,
    });
    await this.periods.save(period);
    return period;
  }
}
