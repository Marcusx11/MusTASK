import type { Period } from "../../domain/period";
import { InvalidPeriodOrderError } from "../errors";
import type { PeriodRepository } from "../ports";

/**
 * Recebe TODOS os IDs de período na nova ordem e renumera de 1 a n.
 * Exigir a lista completa impede buracos e posições repetidas.
 */
export class ReorderPeriods {
  constructor(private readonly periods: PeriodRepository) {}

  async execute(input: { orderedIds: string[] }): Promise<Period[]> {
    const current = await this.periods.findAll();
    const byId = new Map(current.map((p) => [p.id, p]));

    const unique = new Set(input.orderedIds);
    const sameSet =
      unique.size === input.orderedIds.length &&
      unique.size === current.length &&
      input.orderedIds.every((id) => byId.has(id));
    if (!sameSet) {
      throw new InvalidPeriodOrderError(
        "A nova ordem precisa conter todos os períodos existentes, cada um uma única vez.",
      );
    }

    const reordered = input.orderedIds.map((id, index) => byId.get(id)!.withPosition(index + 1));
    await this.periods.saveAll(reordered);
    return reordered;
  }
}
