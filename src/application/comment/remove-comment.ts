import { CommentNotFoundError } from "../errors";
import type { CommentRepository } from "../ports";

/** Exclusão definitiva (sem lixeira). */
export class RemoveComment {
  constructor(private readonly comments: CommentRepository) {}

  async execute(input: { commentId: string }): Promise<void> {
    if (!(await this.comments.findById(input.commentId))) {
      throw new CommentNotFoundError(`Comentário não encontrado: "${input.commentId}".`);
    }
    await this.comments.delete(input.commentId);
  }
}
