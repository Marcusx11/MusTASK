import { describe, expect, it } from "vitest";
import { InvalidPeriodError } from "../errors";
import { Period } from "../period";

describe("Period", () => {
  it("cria um período com nome (sem espaços nas pontas) e posição", () => {
    const period = Period.create({ id: "p1", name: "  Início da manhã ", position: 1 });
    expect(period).toMatchObject({ name: "Início da manhã", position: 1 });
  });

  it("exige nome", () => {
    expect(() => Period.create({ id: "p1", name: "  ", position: 1 })).toThrow(InvalidPeriodError);
  });

  it("exige posição inteira a partir de 1", () => {
    expect(() => Period.create({ id: "p1", name: "Tarde", position: 0 })).toThrow(InvalidPeriodError);
    expect(() => Period.create({ id: "p1", name: "Tarde", position: 1.5 })).toThrow(InvalidPeriodError);
  });

  it("withPosition devolve uma cópia na nova posição sem alterar o original", () => {
    const original = Period.create({ id: "p1", name: "Tarde", position: 3 });
    const moved = original.withPosition(2);
    expect(moved).toMatchObject({ id: "p1", name: "Tarde", position: 2 });
    expect(original.position).toBe(3);
  });
});
