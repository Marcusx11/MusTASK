import { beforeEach, describe, expect, it } from "vitest";
import { createInMemoryWorld, type InMemoryWorld } from "../../../adapters/in-memory/world";
import { TaskAlreadyCompletedError } from "../../../domain/errors";
import { TaskNotFoundError } from "../../errors";

describe("EditChecklistItem + RemoveChecklistItem", () => {
  let w: InMemoryWorld;
  let taskId: string;
  let itemId: string;

  beforeEach(async () => {
    w = createInMemoryWorld();
    const cat = await w.createCategory.execute({ name: "Trabalho" });
    taskId = (await w.createTask.execute({ title: "Migrar banco", categoryId: cat.id, size: "long" })).id;
    itemId = (await w.addChecklistItem.execute({ taskId, text: "Backup" })).checklist[0]!.id;
  });

  it("edita e persiste", async () => {
    await w.editChecklistItem.execute({ taskId, itemId, text: "Backup completo" });
    expect((await w.repos.tasks.findById(taskId))?.checklist[0]?.text).toBe("Backup completo");
  });

  it("remove e persiste", async () => {
    await w.removeChecklistItem.execute({ taskId, itemId });
    expect((await w.repos.tasks.findById(taskId))?.checklist).toEqual([]);
  });

  it("bloqueia em tarefa concluída sem alterar nada", async () => {
    await w.completeTask.execute({ taskId });

    await expect(w.editChecklistItem.execute({ taskId, itemId, text: "x" })).rejects.toThrow(
      TaskAlreadyCompletedError,
    );
    await expect(w.removeChecklistItem.execute({ taskId, itemId })).rejects.toThrow(
      TaskAlreadyCompletedError,
    );
    expect((await w.repos.tasks.findById(taskId))?.checklist[0]?.text).toBe("Backup");
  });

  it("rejeita tarefa inexistente", async () => {
    await expect(w.editChecklistItem.execute({ taskId: "x", itemId, text: "a" })).rejects.toThrow(
      TaskNotFoundError,
    );
    await expect(w.removeChecklistItem.execute({ taskId: "x", itemId })).rejects.toThrow(
      TaskNotFoundError,
    );
  });
});
