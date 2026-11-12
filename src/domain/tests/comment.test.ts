import { describe, expect, it } from "vitest";
import { Comment } from "../comment";
import { InvalidCommentError } from "../errors";
import { LocalDate } from "../local-date";

describe("Comment", () => {
  const createdAt = LocalDate.parse("2026-11-12");

  it("cria com texto sem espaços nas pontas", () => {
    const comment = Comment.create({ id: "c1", taskId: "t1", text: "  Travou no índice ", createdAt });
    expect(comment).toMatchObject({ taskId: "t1", text: "Travou no índice" });
    expect(comment.createdAt.toString()).toBe("2026-11-12");
  });

  it("rejeita comentário vazio", () => {
    expect(() => Comment.create({ id: "c1", taskId: "t1", text: " ", createdAt })).toThrow(
      InvalidCommentError,
    );
  });
});
