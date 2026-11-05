import { beforeEach, describe, expect, it } from "vitest";
import { FixedClock } from "../../adapters/in-memory/fixed-clock";
import { InMemoryWeekRepository } from "../../adapters/in-memory/repositories";
import { SequentialIdGenerator } from "../../adapters/in-memory/sequential-id-generator";
import { LocalDate } from "../../domain/local-date";
import { CreateWeek } from "../create-week";
import { WeekAlreadyExistsError } from "../errors";

describe("CreateWeek", () => {
  let weeks: InMemoryWeekRepository;
  let clock: FixedClock;
  let createWeek: CreateWeek;

  beforeEach(() => {
    weeks = new InMemoryWeekRepository();
    clock = new FixedClock(LocalDate.parse("2026-11-05")); // quinta
    createWeek = new CreateWeek(weeks, clock, new SequentialIdGenerator("week"));
  });

  it("sem data, cria a semana de hoje (segunda 02/11)", async () => {
    const week = await createWeek.execute();
    expect(week.monday.toString()).toBe("2026-11-02");
    expect(weeks.items.size).toBe(1);
  });

  it("bloqueia uma segunda semana cobrindo os mesmos dias", async () => {
    await createWeek.execute(); // cadastrada na quinta 05/11

    clock.set(LocalDate.parse("2026-11-07")); // sábado da mesma semana
    await expect(createWeek.execute()).rejects.toThrow(WeekAlreadyExistsError);
    expect(weeks.items.size).toBe(1);
  });

  it("permite a semana seguinte", async () => {
    await createWeek.execute();

    clock.set(LocalDate.parse("2026-11-09")); // segunda seguinte
    const next = await createWeek.execute();
    expect(next.monday.toString()).toBe("2026-11-09");
    expect(weeks.items.size).toBe(2);
  });

  it("aceita uma data informada no lugar de hoje", async () => {
    const week = await createWeek.execute({ date: LocalDate.parse("2026-11-08") });
    expect(week.monday.toString()).toBe("2026-11-02");
  });
});
