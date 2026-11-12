import { describe, expect, it } from "vitest";
import { Comment } from "../comment";
import { InvalidCommentError } from "../errors";
import { LocalDate } from "../local-date";

describe("Comment.edit", () => {
  const created = LocalDate.parse("2026-11-10");
  const today = LocalDate.parse("2026-11-12");
  const original = () => Comment.create({ id: "c1", taskId: "t1", text: "Travou", createdAt: created });

  it("comentário novo não tem editedAt", () => {
    expect(original().editedAt).toBeUndefined();
  });

  it("troca o texto, preserva createdAt e marca editedAt", () => {
    const edited = original().edit("  Travou no índice ", today);
    expect(edited.text).toBe("Travou no índice");
    expect(edited.createdAt.toString()).toBe("2026-11-10");
    expect(edited.editedAt?.toString()).toBe("2026-11-12");
  });

  it("rejeita texto vazio", () => {
    expect(() => original().edit(" ", today)).toThrow(InvalidCommentError);
  });
});
