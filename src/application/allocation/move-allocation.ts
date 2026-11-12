import { type Allocation, isWeekday } from "../../domain/allocation";
import { InvalidAllocationError } from "../../domain/errors";
import { AllocationNotFoundError, PeriodNotFoundError } from "../errors";
import type { AllocationRepository, PeriodRepository } from "../ports";
import { cardsInCell } from "./cell";

/**
 * Arrastar um card: para outra posição na mesma célula, ou para outra célula
 * (dia + período) da mesma semana. `position` é onde o card fica no destino (1 = topo).
 * Renumera de 1 a n a célula de origem e a de destino.
 */
export class MoveAllocation {
  constructor(
    private readonly allocations: AllocationRepository,
    private readonly periods: PeriodRepository,
  ) {}

  async execute(input: {
    allocationId: string;
    weekday: number;
    periodId: string;
    position: number;
  }): Promise<Allocation> {
    const { weekday, periodId, position } = input;
    if (!isWeekday(weekday)) {
      throw new InvalidAllocationError(
        `Dia da semana inválido: ${weekday}. Use 1 (segunda) a 7 (domingo).`,
      );
    }

    const moving = await this.allocations.findById(input.allocationId);
    if (!moving) {
      throw new AllocationNotFoundError(`Alocação não encontrada: "${input.allocationId}".`);
    }
    if (!(await this.periods.findById(periodId))) {
      throw new PeriodNotFoundError(`Período não encontrado: "${periodId}".`);
    }

    const others = (await this.allocations.findByWeek(moving.weekId)).filter(
      (a) => a.id !== moving.id,
    );

    const target = cardsInCell(others, weekday, periodId);
    if (!Number.isInteger(position) || position < 1 || position > target.length + 1) {
      throw new InvalidAllocationError(
        `Posição inválida: ${position}. Use de 1 a ${target.length + 1} nesta célula.`,
      );
    }

    const moved = moving.moveTo({ weekday, periodId, position });
    target.splice(position - 1, 0, moved);
    const changed = target.map((a, i) => (a === moved ? moved : a.withPosition(i + 1)));

    // Mudou de célula: fecha o buraco que ficou na origem.
    if (!moving.isIn(weekday, periodId)) {
      const source = cardsInCell(others, moving.weekday, moving.periodId);
      changed.push(...source.map((a, i) => a.withPosition(i + 1)));
    }

    await this.allocations.saveAll(changed);
    return moved;
  }
}
