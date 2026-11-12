import { beforeEach, describe, expect, it } from "vitest";
import { createInMemoryWorld, type InMemoryWorld } from "../../../adapters/in-memory/world";
import { TaskAlreadyCompletedError } from "../../../domain/errors";
import { TaskNotFoundError } from "../../errors";

describe("AddChecklistItem + ToggleChecklistItem", () => {
  let w: InMemoryWorld;
  let taskId: string;

  beforeEach(async () => {
    w = createInMemoryWorld();
    const cat = await w.createCategory.execute({ name: "Trabalho" });
    taskId = (await w.createTask.execute({ title: "Migrar banco", categoryId: cat.id, size: "long" })).id;
  });

  it("adiciona, marca e persiste o progresso", async () => {
    const withItem = await w.addChecklistItem.execute({ taskId, text: "Backup" });
    const itemId = withItem.checklist[0]!.id;

    await w.toggleChecklistItem.execute({ taskId, itemId });

    const saved = await w.repos.tasks.findById(taskId);
    expect(saved?.checklistProgress).toEqual({ done: 1, total: 1 });
    expect(saved?.isCompleted).toBe(false); // concluir é manual
  });

  it("bloqueia alterações em tarefa concluída", async () => {
    const withItem = await w.addChecklistItem.execute({ taskId, text: "Backup" });
    await w.completeTask.execute({ taskId });

    await expect(w.addChecklistItem.execute({ taskId, text: "Outro" })).rejects.toThrow(
      TaskAlreadyCompletedError,
    );
    await expect(
      w.toggleChecklistItem.execute({ taskId, itemId: withItem.checklist[0]!.id }),
    ).rejects.toThrow(TaskAlreadyCompletedError);
  });

  it("rejeita tarefa inexistente", async () => {
    await expect(w.addChecklistItem.execute({ taskId: "x", text: "a" })).rejects.toThrow(
      TaskNotFoundError,
    );
    await expect(w.toggleChecklistItem.execute({ taskId: "x", itemId: "i" })).rejects.toThrow(
      TaskNotFoundError,
    );
  });
});
