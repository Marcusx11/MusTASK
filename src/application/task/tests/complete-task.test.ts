import { beforeEach, describe, expect, it } from "vitest";
import { FixedClock } from "../../../adapters/in-memory/fixed-clock";
import {
  InMemoryCategoryRepository,
  InMemoryTaskRepository,
} from "../../../adapters/in-memory/repositories";
import { SequentialIdGenerator } from "../../../adapters/in-memory/sequential-id-generator";
import { InvalidCompletionDateError, TaskAlreadyCompletedError } from "../../../domain/errors";
import { LocalDate } from "../../../domain/local-date";
import { CreateCategory } from "../../category/create-category";
import { TaskNotFoundError } from "../../errors";
import { CompleteTask } from "../complete-task";
import { CreateTask } from "../create-task";

describe("CompleteTask", () => {
  let tasks: InMemoryTaskRepository;
  let completeTask: CompleteTask;
  let readId: string;
  let prId: string;

  beforeEach(async () => {
    const ids = new SequentialIdGenerator();
    const categories = new InMemoryCategoryRepository();
    tasks = new InMemoryTaskRepository();

    const personal = await new CreateCategory(categories, ids).execute({ name: "Pessoal" });
    const createTask = new CreateTask(tasks, categories, ids);
    readId = (await createTask.execute({ title: "Ler", categoryId: personal.id, size: "medium" })).id;
    prId = (await createTask.execute({ title: "Revisar PR", categoryId: personal.id, size: "quick" })).id;

    completeTask = new CompleteTask(tasks, new FixedClock(LocalDate.parse("2026-11-05")));
  });

  it("sem data, conclui hoje e tira a tarefa do backlog", async () => {
    const done = await completeTask.execute({ taskId: readId });

    expect(done.completedAt?.toString()).toBe("2026-11-05");
    expect((await tasks.findById(readId))?.isCompleted).toBe(true);
    expect((await tasks.findBacklog()).map((t) => t.id)).toEqual([prId]);
  });

  it("aceita uma data passada informada pelo usuário", async () => {
    const done = await completeTask.execute({ taskId: readId, date: LocalDate.parse("2026-11-02") });
    expect(done.completedAt?.toString()).toBe("2026-11-02");
  });

  it("rejeita data futura sem alterar nada", async () => {
    await expect(
      completeTask.execute({ taskId: readId, date: LocalDate.parse("2026-11-06") }),
    ).rejects.toThrow(InvalidCompletionDateError);
    expect((await tasks.findBacklog()).length).toBe(2);
  });

  it("rejeita concluir de novo, mantendo a data original", async () => {
    await completeTask.execute({ taskId: readId, date: LocalDate.parse("2026-11-02") });

    await expect(completeTask.execute({ taskId: readId })).rejects.toThrow(TaskAlreadyCompletedError);
    expect((await tasks.findById(readId))?.completedAt?.toString()).toBe("2026-11-02");
  });

  it("rejeita tarefa inexistente", async () => {
    await expect(completeTask.execute({ taskId: "x" })).rejects.toThrow(TaskNotFoundError);
  });
});
