import { InvalidCompletionDateError, InvalidTaskError, TaskAlreadyCompletedError } from "./errors";
import type { LocalDate } from "./local-date";

/** Tamanho em faixas: usado para saber se a tarefa cabe num momento de ócio. */
export const TASK_SIZES = ["quick", "medium", "long"] as const;
export type TaskSize = (typeof TASK_SIZES)[number];

export function isTaskSize(value: unknown): value is TaskSize {
  return typeof value === "string" && (TASK_SIZES as readonly string[]).includes(value);
}

/**
 * Tarefa do backlog. Título, categoria e tamanho são obrigatórios.
 * `completedAt` preenchido = concluída (e fora do backlog).
 */
export class Task {
  private constructor(
    readonly id: string,
    readonly title: string,
    readonly categoryId: string,
    readonly size: TaskSize,
    readonly completedAt: LocalDate | undefined = undefined,
  ) {}

  get isCompleted(): boolean {
    return !!this.completedAt;
  }

  /**
   * Devolve uma cópia concluída em `date`.
   * `today` vem de fora (Clock) para o domínio não depender do relógio da máquina.
   */
  complete(date: LocalDate, today: LocalDate): Task {
    if (this.completedAt) {
      throw new TaskAlreadyCompletedError(
        `A tarefa "${this.title}" já foi concluída em ${this.completedAt.toString()}.`,
      );
    }
    if (date.isAfter(today)) {
      throw new InvalidCompletionDateError(
        `A data de conclusão (${date.toString()}) não pode ser futura.`,
      );
    }
    return new Task(this.id, this.title, this.categoryId, this.size, date);
  }

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
