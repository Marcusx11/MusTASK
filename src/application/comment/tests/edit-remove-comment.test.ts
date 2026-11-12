import { beforeEach, describe, expect, it } from "vitest";
import { createInMemoryWorld, type InMemoryWorld } from "../../../adapters/in-memory/world";
import { InvalidCommentError } from "../../../domain/errors";
import { LocalDate } from "../../../domain/local-date";
import { CommentNotFoundError } from "../../errors";

describe("EditComment + RemoveComment", () => {
  let w: InMemoryWorld;
  let taskId: string;
  let commentId: string;

  beforeEach(async () => {
    w = createInMemoryWorld("2026-11-10");
    const cat = await w.createCategory.execute({ name: "Trabalho" });
    taskId = (await w.createTask.execute({ title: "Migrar banco", categoryId: cat.id, size: "long" })).id;
    commentId = (await w.addComment.execute({ taskId, text: "Travou" })).id;
    w.clock.set(LocalDate.parse("2026-11-12"));
  });

  it("edita com editedAt de hoje e preserva createdAt", async () => {
    await w.editComment.execute({ commentId, text: "Travou no índice" });

    const saved = await w.repos.comments.findById(commentId);
    expect(saved?.text).toBe("Travou no índice");
    expect(saved?.createdAt.toString()).toBe("2026-11-10");
    expect(saved?.editedAt?.toString()).toBe("2026-11-12");
  });

  it("remove definitivamente", async () => {
    await w.removeComment.execute({ commentId });
    expect(await w.repos.comments.findById(commentId)).toBeUndefined();
  });

  it("permite editar e remover mesmo com a tarefa concluída", async () => {
    await w.completeTask.execute({ taskId });
    await expect(w.editComment.execute({ commentId, text: "Resolvido" })).resolves.toBeDefined();
    await expect(w.removeComment.execute({ commentId })).resolves.toBeUndefined();
  });

  it("rejeita texto vazio (sem alterar) e comentário inexistente", async () => {
    await expect(w.editComment.execute({ commentId, text: "" })).rejects.toThrow(InvalidCommentError);
    expect((await w.repos.comments.findById(commentId))?.text).toBe("Travou");

    await expect(w.editComment.execute({ commentId: "x", text: "a" })).rejects.toThrow(
      CommentNotFoundError,
    );
    await expect(w.removeComment.execute({ commentId: "x" })).rejects.toThrow(CommentNotFoundError);
  });

  it("o quadro da semana mostra o comentário editado e some com o removido", async () => {
    const weekId = (await w.createWeek.execute()).id;
    const periodId = (await w.createPeriod.execute({ name: "Manhã" })).id;
    await w.allocateTask.execute({ taskId, weekId, weekday: 1, periodId });
    const card = async () => (await w.getWeekPlan.execute({ weekId })).days[0]!.periods[0]!.cards[0]!;

    await w.editComment.execute({ commentId, text: "Travou no índice" });
    expect((await card()).comments).toEqual([
      { id: commentId, text: "Travou no índice", createdAt: "2026-11-10", editedAt: "2026-11-12" },
    ]);

    await w.removeComment.execute({ commentId });
    expect((await card()).comments).toEqual([]);
  });
});
