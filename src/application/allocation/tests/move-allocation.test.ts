import { beforeEach, describe, expect, it } from "vitest";
import { createInMemoryWorld, type InMemoryWorld } from "../../../adapters/in-memory/world";
import { InvalidAllocationError } from "../../../domain/errors";
import { AllocationNotFoundError, PeriodNotFoundError } from "../../errors";

describe("Posição dos cards: AllocateTask + MoveAllocation", () => {
  let w: InMemoryWorld;
  let weekId: string;
  let morning: string;
  let afternoon: string;
  const card: Record<string, string> = {}; // título → allocationId

  /** Títulos de uma célula na ordem de posição, ex.: ["A", "B"]. */
  const cell = async (weekday: number, periodId: string) => {
    const all = await w.repos.allocations.findByWeek(weekId);
    const inCell = all
      .filter((a) => a.weekday === weekday && a.periodId === periodId)
      .sort((a, b) => a.position - b.position);
    expect(inCell.map((a) => a.position)).toEqual(inCell.map((_, i) => i + 1)); // sem buracos
    const titleOf = Object.fromEntries(Object.entries(card).map(([t, id]) => [id, t]));
    return inCell.map((a) => titleOf[a.id]);
  };

  beforeEach(async () => {
    w = createInMemoryWorld();
    const cat = await w.createCategory.execute({ name: "Trabalho" });
    weekId = (await w.createWeek.execute()).id;
    morning = (await w.createPeriod.execute({ name: "Manhã" })).id;
    afternoon = (await w.createPeriod.execute({ name: "Tarde" })).id;

    for (const title of ["A", "B", "C"]) {
      const task = await w.createTask.execute({ title, categoryId: cat.id, size: "quick" });
      card[title] = (await w.allocateTask.execute({ taskId: task.id, weekId, weekday: 1, periodId: morning })).id;
    }
  });

  it("cada alocação nova entra no fim da sua célula", async () => {
    expect(await cell(1, morning)).toEqual(["A", "B", "C"]);
  });

  it("reordena dentro da mesma célula", async () => {
    await w.moveAllocation.execute({ allocationId: card.C!, weekday: 1, periodId: morning, position: 1 });
    expect(await cell(1, morning)).toEqual(["C", "A", "B"]);

    await w.moveAllocation.execute({ allocationId: card.C!, weekday: 1, periodId: morning, position: 3 });
    expect(await cell(1, morning)).toEqual(["A", "B", "C"]);
  });

  it("move para outra célula e fecha o buraco na origem", async () => {
    await w.moveAllocation.execute({ allocationId: card.B!, weekday: 2, periodId: afternoon, position: 1 });

    expect(await cell(1, morning)).toEqual(["A", "C"]);
    expect(await cell(2, afternoon)).toEqual(["B"]);
  });

  it("insere no meio de uma célula já ocupada", async () => {
    await w.moveAllocation.execute({ allocationId: card.A!, weekday: 1, periodId: afternoon, position: 1 });
    await w.moveAllocation.execute({ allocationId: card.C!, weekday: 1, periodId: afternoon, position: 1 });
    // Tarde: C, A — agora B entra entre os dois
    await w.moveAllocation.execute({ allocationId: card.B!, weekday: 1, periodId: afternoon, position: 2 });

    expect(await cell(1, morning)).toEqual([]);
    expect(await cell(1, afternoon)).toEqual(["C", "B", "A"]);
  });

  it("rejeita posição fora da célula, dia inválido, período ou card inexistente", async () => {
    const move = (over: object) =>
      w.moveAllocation.execute({ allocationId: card.A!, weekday: 1, periodId: morning, position: 1, ...over });

    await expect(move({ position: 4 })).rejects.toThrow(InvalidAllocationError); // célula tem 3 → 1..3
    await expect(move({ position: 0 })).rejects.toThrow(InvalidAllocationError);
    await expect(move({ weekday: 8 })).rejects.toThrow(InvalidAllocationError);
    await expect(move({ periodId: "x" })).rejects.toThrow(PeriodNotFoundError);
    await expect(move({ allocationId: "x" })).rejects.toThrow(AllocationNotFoundError);

    expect(await cell(1, morning)).toEqual(["A", "B", "C"]);
  });
});
