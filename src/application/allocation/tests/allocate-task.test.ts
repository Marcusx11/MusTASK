import { beforeEach, describe, expect, it } from "vitest";
import { FixedClock } from "../../../adapters/in-memory/fixed-clock";
import {
  InMemoryAllocationRepository,
  InMemoryCategoryRepository,
  InMemoryPeriodRepository,
  InMemoryTaskRepository,
  InMemoryWeekRepository,
} from "../../../adapters/in-memory/repositories";
import { SequentialIdGenerator } from "../../../adapters/in-memory/sequential-id-generator";
import { InvalidTimeError, TaskAlreadyCompletedError } from "../../../domain/errors";
import { CompleteTask } from "../../task/complete-task";
import { LocalDate } from "../../../domain/local-date";
import { AllocateTask } from "../allocate-task";
import { CreateCategory } from "../../category/create-category";
import { CreatePeriod } from "../../period/create-period";
import { CreateTask } from "../../task/create-task";
import { CreateWeek } from "../../week/create-week";
import { PeriodNotFoundError, TaskNotFoundError, WeekNotFoundError } from "../../errors";

describe("AllocateTask", () => {
  let allocations: InMemoryAllocationRepository;
  let allocateTask: AllocateTask;
  let taskId: string;
  let weekId: string;
  let morningId: string;
  let completeTask: CompleteTask;

  beforeEach(async () => {
    const ids = new SequentialIdGenerator();
    const categories = new InMemoryCategoryRepository();
    const tasks = new InMemoryTaskRepository();
    completeTask = new CompleteTask(tasks, new FixedClock(LocalDate.parse("2026-11-05")));
    const weeks = new InMemoryWeekRepository();
    const periods = new InMemoryPeriodRepository();
    allocations = new InMemoryAllocationRepository();

    const work = await new CreateCategory(categories, ids).execute({ name: "Trabalho" });
    const task = await new CreateTask(tasks, categories, ids).execute({
      title: "Migrar banco",
      categoryId: work.id,
      size: "long",
    });
    const week = await new CreateWeek(
      weeks,
      new FixedClock(LocalDate.parse("2026-11-05")),
      ids,
    ).execute();
    const morning = await new CreatePeriod(periods, ids).execute({ name: "Manhã" });

    taskId = task.id;
    weekId = week.id;
    morningId = morning.id;
    allocateTask = new AllocateTask(allocations, tasks, weeks, periods, ids);
  });

  it("não aloca tarefa já concluída", async () => {
    await completeTask.execute({ taskId });

    await expect(
      allocateTask.execute({ taskId, weekId, weekday: 5, periodId: morningId }),
    ).rejects.toThrow(TaskAlreadyCompletedError);
    expect(allocations.items.size).toBe(0);
  });

  it("aloca uma tarefa num dia + período da semana, com horário opcional", async () => {
    const allocation = await allocateTask.execute({
      taskId,
      weekId,
      weekday: 1,
      periodId: morningId,
      time: "09:30",
    });

    expect(allocation).toMatchObject({ taskId, weekId, weekday: 1, periodId: morningId });
    expect(allocation.time?.toString()).toBe("09:30");
    expect(await allocations.findByWeek(weekId)).toHaveLength(1);
  });

  it("permite a mesma tarefa várias vezes, inclusive no mesmo período", async () => {
    const slot = { taskId, weekId, periodId: morningId };
    await allocateTask.execute({ ...slot, weekday: 1 });
    await allocateTask.execute({ ...slot, weekday: 1 });
    await allocateTask.execute({ ...slot, weekday: 2 });

    expect(await allocations.findByWeek(weekId)).toHaveLength(3);
  });

  it("exige tarefa, semana e período existentes", async () => {
    const valid = { taskId, weekId, weekday: 1, periodId: morningId };

    await expect(allocateTask.execute({ ...valid, taskId: "x" })).rejects.toThrow(TaskNotFoundError);
    await expect(allocateTask.execute({ ...valid, weekId: "x" })).rejects.toThrow(WeekNotFoundError);
    await expect(allocateTask.execute({ ...valid, periodId: "x" })).rejects.toThrow(
      PeriodNotFoundError,
    );
    expect(allocations.items.size).toBe(0);
  });

  it("rejeita horário inválido sem salvar", async () => {
    await expect(
      allocateTask.execute({ taskId, weekId, weekday: 1, periodId: morningId, time: "25:00" }),
    ).rejects.toThrow(InvalidTimeError);
    expect(allocations.items.size).toBe(0);
  });
});
