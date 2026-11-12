import type { Comment } from "../../domain/comment";
import { CommentNotFoundError } from "../errors";
import type { Clock, CommentRepository } from "../ports";

/** Edita o texto; marca `editedAt` com a data de hoje. */
export class EditComment {
  constructor(
    private readonly comments: CommentRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: { commentId: string; text: string }): Promise<Comment> {
    const comment = await this.comments.findById(input.commentId);
    if (!comment) {
      throw new CommentNotFoundError(`Comentário não encontrado: "${input.commentId}".`);
    }
    const edited = comment.edit(input.text, this.clock.today());
    await this.comments.save(edited);
    return edited;
  }
}
