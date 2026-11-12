import { describe, expect, it } from "vitest";
import { Allocation } from "../allocation";
import { InvalidAllocationError, InvalidTimeError } from "../errors";

const base = { id: "a1", taskId: "t1", weekId: "w1", weekday: 1, periodId: "p1", position: 1 };

describe("Allocation", () => {
  it("cria sem horário", () => {
    const allocation = Allocation.create(base);
    expect(allocation.weekday).toBe(1);
    expect(allocation.time).toBeUndefined();
  });

  it("aceita horário HH:MM", () => {
    const allocation = Allocation.create({ ...base, time: "09:30" });
    expect(allocation.time?.toString()).toBe("09:30");
  });

  it("rejeita horário fora do formato ou inexistente", () => {
    expect(() => Allocation.create({ ...base, time: "25:00" })).toThrow(InvalidTimeError);
    expect(() => Allocation.create({ ...base, time: "9h" })).toThrow(InvalidTimeError);
    expect(() => Allocation.create({ ...base, time: "9:30" })).toThrow(InvalidTimeError);
  });

  it("aceita dias 1 (segunda) a 7 (domingo) e rejeita o resto", () => {
    expect(Allocation.create({ ...base, weekday: 7 }).weekday).toBe(7);
    expect(() => Allocation.create({ ...base, weekday: 0 })).toThrow(InvalidAllocationError);
    expect(() => Allocation.create({ ...base, weekday: 8 })).toThrow(InvalidAllocationError);
    expect(() => Allocation.create({ ...base, weekday: 2.5 })).toThrow(InvalidAllocationError);
  });

  it("exige posição inteira a partir de 1", () => {
    expect(() => Allocation.create({ ...base, position: 0 })).toThrow(InvalidAllocationError);
    expect(() => Allocation.create({ ...base, position: 1.5 })).toThrow(InvalidAllocationError);
  });

  it("moveTo devolve uma cópia em outra célula, mantendo semana, tarefa e horário", () => {
    const original = Allocation.create({ ...base, time: "09:30" });
    const moved = original.moveTo({ weekday: 3, periodId: "p2", position: 2 });

    expect(moved).toMatchObject({ id: "a1", taskId: "t1", weekId: "w1", weekday: 3, periodId: "p2", position: 2 });
    expect(moved.time?.toString()).toBe("09:30");
    expect(original.isIn(1, "p1")).toBe(true);
  });
});
