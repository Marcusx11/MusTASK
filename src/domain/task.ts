import {
  ChecklistItemNotFoundError,
  InvalidChecklistItemError,
  InvalidCompletionDateError,
  InvalidTaskError,
  TaskAlreadyCompletedError,
} from "./errors";
import type { LocalDate } from "./local-date";

/** Tamanho em faixas: usado para saber se a tarefa cabe num momento de ócio. */
export const TASK_SIZES = ["quick", "medium", "long"] as const;
export type TaskSize = (typeof TASK_SIZES)[number];

export function isTaskSize(value: unknown): value is TaskSize {
  return typeof value === "string" && (TASK_SIZES as readonly string[]).includes(value);
}

/** Item do checklist de uma tarefa. Marcar todos NÃO conclui a tarefa. */
export interface ChecklistItem {
  readonly id: string;
  readonly text: string;
  readonly done: boolean;
}

/**
 * Tarefa do backlog. Título, categoria e tamanho são obrigatórios.
 * `completedAt` preenchido = concluída (e fora do backlog).
 * O checklist pertence à tarefa: aparece igual em todos os cards dela.
 */
export class Task {
  private constructor(
    readonly id: string,
    readonly title: string,
    readonly categoryId: string,
    readonly size: TaskSize,
    readonly completedAt: LocalDate | undefined = undefined,
    readonly checklist: readonly ChecklistItem[] = [],
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

  get isCompleted(): boolean {
    return !!this.completedAt;
  }

  get checklistProgress(): { done: number; total: number } {
    return {
      done: this.checklist.filter((item) => item.done).length,
      total: this.checklist.length,
    };
  }

  /**
   * Devolve uma cópia concluída em `date`.
   * `today` vem de fora (Clock) para o domínio não depender do relógio da máquina.
   */
  complete(date: LocalDate, today: LocalDate): Task {
    this.ensureNotCompleted();
    if (date.isAfter(today)) {
      throw new InvalidCompletionDateError(
        `A data de conclusão (${date.toString()}) não pode ser futura.`,
      );
    }
    return this.copy({ completedAt: date });
  }

  addChecklistItem(itemId: string, text: string): Task {
    this.ensureNotCompleted();
    const item = { id: itemId, text: checklistText(text), done: false };
    return this.copy({ checklist: [...this.checklist, item] });
  }

  /** Marca o item se estiver desmarcado, e vice-versa. */
  toggleChecklistItem(itemId: string): Task {
    this.ensureNotCompleted();
    this.ensureChecklistItem(itemId);
    return this.copy({
      checklist: this.checklist.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item,
      ),
    });
  }

  /** Troca o texto do item, mantendo se está marcado ou não. */
  editChecklistItem(itemId: string, text: string): Task {
    this.ensureNotCompleted();
    this.ensureChecklistItem(itemId);
    const newText = checklistText(text);
    return this.copy({
      checklist: this.checklist.map((item) =>
        item.id === itemId ? { ...item, text: newText } : item,
      ),
    });
  }

  removeChecklistItem(itemId: string): Task {
    this.ensureNotCompleted();
    this.ensureChecklistItem(itemId);
    return this.copy({ checklist: this.checklist.filter((item) => item.id !== itemId) });
  }

  private ensureChecklistItem(itemId: string): void {
    if (!this.checklist.some((item) => item.id === itemId)) {
      throw new ChecklistItemNotFoundError(`Item de checklist não encontrado: "${itemId}".`);
    }
  }

  private ensureNotCompleted(): void {
    if (this.completedAt) {
      throw new TaskAlreadyCompletedError(
        `A tarefa "${this.title}" já foi concluída em ${this.completedAt.toString()}.`,
      );
    }
  }

  private copy(changes: {
    completedAt?: LocalDate;
    checklist?: readonly ChecklistItem[];
  }): Task {
    return new Task(
      this.id,
      this.title,
      this.categoryId,
      this.size,
      changes.completedAt ?? this.completedAt,
      changes.checklist ?? this.checklist,
    );
  }
}

function checklistText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new InvalidChecklistItemError("O item do checklist precisa de um texto.");
  }
  return trimmed;
}
