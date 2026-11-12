import { beforeEach, describe, expect, it } from "vitest";
import { createInMemoryWorld, type InMemoryWorld } from "../../../adapters/in-memory/world";
import { LocalDate } from "../../../domain/local-date";
import { WeekNotFoundError } from "../../errors";
import type { WeekPlan } from "../get-week-plan";

describe("GetWeekPlan (quadro Kanban da semana)", () => {
  let w: InMemoryWorld;
  let weekId: string;
  let ids: Record<string, string>;

  /** Títulos por dia → período, ex.: { "1:Manhã": ["Daily"] } (só células com cards). */
  const board = (plan: WeekPlan) =>
    Object.fromEntries(
      plan.days.flatMap((d) =>
        d.periods
          .filter((p) => p.cards.length > 0)
          .map((p) => [`${d.weekday}:${p.name}`, p.cards.map((c) => c.title)]),
      ),
    );

  beforeEach(async () => {
    w = createInMemoryWorld("2026-11-12"); // quinta
    const work = await w.createCategory.execute({ name: "Trabalho" });
    weekId = (await w.createWeek.execute()).id;

    // Criados fora de ordem e reordenados: a listagem deve respeitar a posição.
    const afternoon = await w.createPeriod.execute({ name: "Tarde" });
    const morning = await w.createPeriod.execute({ name: "Manhã" });
    await w.reorderPeriods.execute({ orderedIds: [morning.id, afternoon.id] });

    const mk = (title: string, size: string) =>
      w.createTask.execute({ title, categoryId: work.id, size });
    const daily = await mk("Daily", "quick");
    const pr = await mk("Revisar PR", "medium");
    const migrate = await mk("Migrar banco", "long");

    const alloc = (taskId: string, weekday: number, periodId: string, time?: string) =>
      w.allocateTask.execute({ taskId, weekId, weekday, periodId, time });
    await alloc(pr.id, 1, morning.id, "09:30");
    await alloc(daily.id, 1, morning.id, "09:00");
    const migrateMon = await alloc(migrate.id, 1, afternoon.id);
    await alloc(migrate.id, 2, morning.id);

    ids = { morning: morning.id, afternoon: afternoon.id, migrate: migrate.id, migrateMon: migrateMon.id };
  });

  it("monta 7 dias com datas, todos os períodos em ordem e dias vazios", async () => {
    const plan = await w.getWeekPlan.execute({ weekId });

    expect(plan.monday).toBe("2026-11-09");
    expect(plan.days.map((d) => d.date)).toEqual([
      "2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15",
    ]);
    // Domingo não tem nada, mas aparece com todos os períodos vazios.
    expect(plan.days[6]!.periods.map((p) => [p.name, p.cards.length])).toEqual([
      ["Manhã", 0],
      ["Tarde", 0],
    ]);
  });

  it("ordena cards pela posição (ordem do usuário), não pelo horário", async () => {
    const plan = await w.getWeekPlan.execute({ weekId });
    expect(board(plan)).toEqual({
      "1:Manhã": ["Revisar PR", "Daily"], // PR (09:30) foi alocado antes da Daily (09:00)
      "1:Tarde": ["Migrar banco"],
      "2:Manhã": ["Migrar banco"],
    });
  });

  it("reflete arrastar cards", async () => {
    await w.moveAllocation.execute({
      allocationId: ids.migrateMon!,
      weekday: 1,
      periodId: ids.morning!,
      position: 1,
    });
    const plan = await w.getWeekPlan.execute({ weekId });
    expect(board(plan)["1:Manhã"]).toEqual(["Migrar banco", "Revisar PR", "Daily"]);
    expect(board(plan)["1:Tarde"]).toBeUndefined();
  });

  it("cada card traz tamanho, categoria, horário, checklist e comentários da tarefa", async () => {
    const withItem = await w.addChecklistItem.execute({ taskId: ids.migrate!, text: "Backup" });
    await w.addChecklistItem.execute({ taskId: ids.migrate!, text: "Rodar migração" });
    await w.toggleChecklistItem.execute({ taskId: ids.migrate!, itemId: withItem.checklist[0]!.id });
    await w.addComment.execute({ taskId: ids.migrate!, text: "Avisar o time" });

    const plan = await w.getWeekPlan.execute({ weekId });
    const mondayPr = plan.days[0]!.periods[0]!.cards[0]!;
    expect(mondayPr).toMatchObject({
      title: "Revisar PR",
      size: "medium",
      category: { name: "Trabalho" },
      time: "09:30",
      completed: false,
      completedAt: null,
      checklist: { items: [], done: 0, total: 0 },
      comments: [],
    });

    // A mesma tarefa em dois cards mostra o mesmo checklist e comentários.
    const migrateCards = plan.days.flatMap((d) => d.periods.flatMap((p) => p.cards)).filter(
      (c) => c.taskId === ids.migrate,
    );
    expect(migrateCards).toHaveLength(2);
    for (const c of migrateCards) {
      expect(c.time).toBeNull();
      expect(c.checklist).toMatchObject({ done: 1, total: 2 });
      expect(c.comments.map((x) => [x.text, x.createdAt])).toEqual([["Avisar o time", "2026-11-12"]]);
    }
  });

  it("tarefa concluída continua no quadro, marcada como concluída", async () => {
    await w.completeTask.execute({ taskId: ids.migrate!, date: LocalDate.parse("2026-11-10") });

    const plan = await w.getWeekPlan.execute({ weekId });
    const cards = plan.days.flatMap((d) => d.periods.flatMap((p) => p.cards));
    expect(cards.filter((c) => c.taskId === ids.migrate).map((c) => [c.completed, c.completedAt])).toEqual([
      [true, "2026-11-10"],
      [true, "2026-11-10"],
    ]);
  });

  it("rejeita semana inexistente", async () => {
    await expect(w.getWeekPlan.execute({ weekId: "x" })).rejects.toThrow(WeekNotFoundError);
  });
});
