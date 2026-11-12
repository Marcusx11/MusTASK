import type { Weekday } from "../../domain/allocation";
import type { TaskSize } from "../../domain/task";
import { cardsInCell } from "../allocation/cell";
import { WeekNotFoundError } from "../errors";
import type {
  AllocationRepository,
  CategoryRepository,
  CommentRepository,
  PeriodRepository,
  TaskRepository,
  WeekRepository,
} from "../ports";

// ---- Read model: o quadro já montado, pronto para a UI (datas como "AAAA-MM-DD"). ----

export interface WeekPlan {
  weekId: string;
  monday: string;
  days: DayColumn[];
}

export interface DayColumn {
  weekday: Weekday;
  date: string;
  periods: PeriodSection[];
}

export interface PeriodSection {
  periodId: string;
  name: string;
  cards: Card[];
}

export interface Card {
  allocationId: string;
  taskId: string;
  title: string;
  size: TaskSize;
  category: { id: string; name: string };
  time: string | null;
  completed: boolean;
  completedAt: string | null;
  checklist: {
    items: { id: string; text: string; done: boolean }[];
    done: number;
    total: number;
  };
  comments: { id: string; text: string; createdAt: string; editedAt: string | null }[];
}

/** Consulta: não altera nada, só monta a visão Kanban da semana. */
export class GetWeekPlan {
  constructor(
    private readonly weeks: WeekRepository,
    private readonly periods: PeriodRepository,
    private readonly allocations: AllocationRepository,
    private readonly tasks: TaskRepository,
    private readonly categories: CategoryRepository,
    private readonly comments: CommentRepository,
  ) {}

  async execute(input: { weekId: string }): Promise<WeekPlan> {
    const week = await this.weeks.findById(input.weekId);
    if (!week) {
      throw new WeekNotFoundError(`Semana não encontrada: "${input.weekId}".`);
    }

    const periods = await this.periods.findAll();
    const allocations = await this.allocations.findByWeek(week.id);

    const taskIds = [...new Set(allocations.map((a) => a.taskId))];
    const tasks = new Map((await this.tasks.findByIds(taskIds)).map((t) => [t.id, t]));
    const categoryIds = [...new Set([...tasks.values()].map((t) => t.categoryId))];
    const categories = new Map(
      (await this.categories.findByIds(categoryIds)).map((c) => [c.id, c]),
    );
    const commentsByTask = new Map<string, Card["comments"]>();
    for (const c of await this.comments.findByTaskIds(taskIds)) {
      const list = commentsByTask.get(c.taskId) ?? [];
      list.push({
        id: c.id,
        text: c.text,
        createdAt: c.createdAt.toString(),
        editedAt: c.editedAt?.toString() ?? null,
      });
      commentsByTask.set(c.taskId, list);
    }

    const days = week.days.map((date, index): DayColumn => {
      const weekday = (index + 1) as Weekday;
      return {
        weekday,
        date: date.toString(),
        periods: periods.map((period) => ({
          periodId: period.id,
          name: period.name,
          cards: cardsInCell(allocations, weekday, period.id).flatMap((a): Card[] => {
            const task = tasks.get(a.taskId);
            if (!task) return []; // dado inconsistente: não quebra o quadro inteiro
            const category = categories.get(task.categoryId);
            return [
              {
                allocationId: a.id,
                taskId: task.id,
                title: task.title,
                size: task.size,
                category: { id: task.categoryId, name: category?.name ?? "" },
                time: a.time?.toString() ?? null,
                completed: task.isCompleted,
                completedAt: task.completedAt?.toString() ?? null,
                checklist: {
                  items: task.checklist.map((i) => ({ id: i.id, text: i.text, done: i.done })),
                  ...task.checklistProgress,
                },
                comments: commentsByTask.get(task.id) ?? [],
              },
            ];
          }),
        })),
      };
    });

    return { weekId: week.id, monday: week.monday.toString(), days };
  }
}
