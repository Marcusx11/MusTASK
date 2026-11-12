import { beforeEach, describe, expect, it } from "vitest";
import { createInMemoryWorld, type InMemoryWorld } from "../../../adapters/in-memory/world";
import { InvalidCommentError } from "../../../domain/errors";
import { TaskNotFoundError } from "../../errors";

describe("AddComment", () => {
  let w: InMemoryWorld;
  let taskId: string;

  beforeEach(async () => {
    w = createInMemoryWorld("2026-11-12");
    const cat = await w.createCategory.execute({ name: "Trabalho" });
    taskId = (await w.createTask.execute({ title: "Migrar banco", categoryId: cat.id, size: "long" })).id;
  });

  it("comenta com a data de hoje", async () => {
    const comment = await w.addComment.execute({ taskId, text: "Índice travou" });
    expect(comment.createdAt.toString()).toBe("2026-11-12");
    expect(await w.repos.comments.findByTaskIds([taskId])).toHaveLength(1);
  });

  it("permite comentar em tarefa concluída", async () => {
    await w.completeTask.execute({ taskId });
    await expect(w.addComment.execute({ taskId, text: "Lição aprendida" })).resolves.toBeDefined();
  });

  it("rejeita texto vazio e tarefa inexistente", async () => {
    await expect(w.addComment.execute({ taskId, text: "" })).rejects.toThrow(InvalidCommentError);
    await expect(w.addComment.execute({ taskId: "x", text: "oi" })).rejects.toThrow(TaskNotFoundError);
    expect(w.repos.comments.items.size).toBe(0);
  });
});
