import { InvalidCommentError } from "./errors";
import type { LocalDate } from "./local-date";

/**
 * Comentário de uma tarefa. Aparece em todos os cards dela.
 * Pode ser editado/removido mesmo com a tarefa concluída.
 */
export class Comment {
  private constructor(
    readonly id: string,
    readonly taskId: string,
    readonly text: string,
    readonly createdAt: LocalDate,
    readonly editedAt: LocalDate | undefined = undefined,
  ) {}

  static create(props: { id: string; taskId: string; text: string; createdAt: LocalDate }): Comment {
    return new Comment(props.id, props.taskId, commentText(props.text), props.createdAt);
  }

  /** Cópia com o novo texto; `createdAt` é preservado e `editedAt` vira `today`. */
  edit(text: string, today: LocalDate): Comment {
    return new Comment(this.id, this.taskId, commentText(text), this.createdAt, today);
  }
}

function commentText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new InvalidCommentError("O comentário precisa de um texto.");
  }
  return trimmed;
}
