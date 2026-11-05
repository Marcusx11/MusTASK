import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryPeriodRepository } from "../../../adapters/in-memory/repositories";
import { SequentialIdGenerator } from "../../../adapters/in-memory/sequential-id-generator";
import { InvalidPeriodError } from "../../../domain/errors";
import { CreatePeriod } from "../create-period";
import { InvalidPeriodOrderError } from "../../errors";
import { ReorderPeriods } from "../reorder-periods";

describe("CreatePeriod + ReorderPeriods", () => {
  let periods: InMemoryPeriodRepository;
  let createPeriod: CreatePeriod;
  let reorderPeriods: ReorderPeriods;

  const names = async () => (await periods.findAll()).map((p) => `${p.position}:${p.name}`);

  beforeEach(async () => {
    periods = new InMemoryPeriodRepository();
    createPeriod = new CreatePeriod(periods, new SequentialIdGenerator("p"));
    reorderPeriods = new ReorderPeriods(periods);

    // O exemplo do usuário, criado fora de ordem.
    for (const name of ["Início da manhã", "Tarde", "Fim da manhã", "Noite"]) {
      await createPeriod.execute({ name });
    }
  });

  it("cada período novo entra no fim", async () => {
    expect(await names()).toEqual([
      "1:Início da manhã",
      "2:Tarde",
      "3:Fim da manhã",
      "4:Noite",
    ]);
  });

  it("rejeita período sem nome", async () => {
    await expect(createPeriod.execute({ name: "" })).rejects.toThrow(InvalidPeriodError);
  });

  it("reordena e renumera de 1 a n", async () => {
    // p-1 Início da manhã, p-2 Tarde, p-3 Fim da manhã, p-4 Noite
    await reorderPeriods.execute({ orderedIds: ["p-1", "p-3", "p-2", "p-4"] });

    expect(await names()).toEqual([
      "1:Início da manhã",
      "2:Fim da manhã",
      "3:Tarde",
      "4:Noite",
    ]);
  });

  it("rejeita ordem com período faltando, repetido ou desconhecido, sem alterar nada", async () => {
    const before = await names();

    for (const orderedIds of [
      ["p-1", "p-2", "p-3"], // faltando
      ["p-1", "p-1", "p-2", "p-3"], // repetido
      ["p-1", "p-2", "p-3", "x"], // desconhecido
    ]) {
      await expect(reorderPeriods.execute({ orderedIds })).rejects.toThrow(InvalidPeriodOrderError);
    }

    expect(await names()).toEqual(before);
  });
});
