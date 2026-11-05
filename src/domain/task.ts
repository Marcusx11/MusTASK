import { InvalidTaskError } from "./errors";

/** Tamanho em faixas: usado para saber se a tarefa cabe num momento de ócio. */
export const TASK_SIZES = ["quick", "medium", "long"] as const;
export type TaskSize = (typeof TASK_SIZES)[number];

export function isTaskSize(value: unknown): value is TaskSize {
  return typeof value === "string" && (TASK_SIZES as readonly string[]).includes(value);
}

/** Tarefa do backlog. Título, categoria e tamanho são obrigatórios. */
export class Task {
  private constructor(
    readonly id: string,
    readonly title: string,
    readonly categoryId: string,
    readonly size: TaskSize,
  ) {}

  static create(props: { id: string; title: string; categoryId: string; size: string }): Task {
    const title = props.title.trim();
    if (!title) {
      throw new InvalidTaskError("A tarefa precisa de um título.");
    }
    if (!props.categoryId) {
      throw new InvalidTaskError("A tarefa precisa de uma categoria.");
    }
    if (!isTaskSize(props.size)) {
      throw new InvalidTaskError(
        `Tamanho inválido: "${props.size}". Use um de: ${TASK_SIZES.join(", ")}.`,
      );
    }
    return new Task(props.id, title, props.categoryId, props.size);
  }
}
