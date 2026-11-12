import type { Allocation, Weekday } from "../../domain/allocation";

/** Cards de uma célula do quadro (dia + período), na ordem de posição. */
export function cardsInCell(
  allocations: readonly Allocation[],
  weekday: Weekday,
  periodId: string,
): Allocation[] {
  return allocations
    .filter((a) => a.isIn(weekday, periodId))
    .sort((a, b) => a.position - b.position);
}
