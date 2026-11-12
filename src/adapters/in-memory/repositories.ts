import type {
  AllocationRepository,
  CategoryRepository,
  CommentRepository,
  PeriodRepository,
  TaskRepository,
  WeekRepository,
} from "../../application/ports";
import type { Allocation } from "../../domain/allocation";
import type { Category } from "../../domain/category";
import type { Comment } from "../../domain/comment";
import type { LocalDate } from "../../domain/local-date";
import type { Period } from "../../domain/period";
import type { Task } from "../../domain/task";
import type { Week } from "../../domain/week";

function pick<T>(items: Map<string, T>, ids: readonly string[]): T[] {
  return ids.flatMap((id) => {
    const item = items.get(id);
    return item ? [item] : [];
  });
}

export class InMemoryCategoryRepository implements CategoryRepository {
  readonly items = new Map<string, Category>();

  async save(category: Category): Promise<void> {
    this.items.set(category.id, category);
  }

  async findById(id: string): Promise<Category | undefined> {
    return this.items.get(id);
  }

  async findByIds(ids: readonly string[]): Promise<Category[]> {
    return pick(this.items, ids);
  }
}

export class InMemoryTaskRepository implements TaskRepository {
  readonly items = new Map<string, Task>();

  async save(task: Task): Promise<void> {
    this.items.set(task.id, task);
  }

  async findById(id: string): Promise<Task | undefined> {
    return this.items.get(id);
  }

  async findByIds(ids: readonly string[]): Promise<Task[]> {
    return pick(this.items, ids);
  }

  async findBacklog(): Promise<Task[]> {
    return [...this.items.values()].filter((t) => !t.isCompleted);
  }
}

export class InMemoryWeekRepository implements WeekRepository {
  readonly items = new Map<string, Week>();

  async save(week: Week): Promise<void> {
    this.items.set(week.id, week);
  }

  async findById(id: string): Promise<Week | undefined> {
    return this.items.get(id);
  }

  async findByMonday(monday: LocalDate): Promise<Week | undefined> {
    return [...this.items.values()].find((w) => w.monday.equals(monday));
  }
}

export class InMemoryPeriodRepository implements PeriodRepository {
  readonly items = new Map<string, Period>();

  async save(period: Period): Promise<void> {
    this.items.set(period.id, period);
  }

  async saveAll(periods: Period[]): Promise<void> {
    for (const period of periods) this.items.set(period.id, period);
  }

  async findById(id: string): Promise<Period | undefined> {
    return this.items.get(id);
  }

  async findAll(): Promise<Period[]> {
    return [...this.items.values()].sort((a, b) => a.position - b.position);
  }
}

export class InMemoryAllocationRepository implements AllocationRepository {
  readonly items = new Map<string, Allocation>();

  async save(allocation: Allocation): Promise<void> {
    this.items.set(allocation.id, allocation);
  }

  async saveAll(allocations: Allocation[]): Promise<void> {
    for (const allocation of allocations) this.items.set(allocation.id, allocation);
  }

  async findById(id: string): Promise<Allocation | undefined> {
    return this.items.get(id);
  }

  async findByWeek(weekId: string): Promise<Allocation[]> {
    return [...this.items.values()].filter((a) => a.weekId === weekId);
  }
}

export class InMemoryCommentRepository implements CommentRepository {
  readonly items = new Map<string, Comment>();

  async save(comment: Comment): Promise<void> {
    this.items.set(comment.id, comment);
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }

  async findById(id: string): Promise<Comment | undefined> {
    return this.items.get(id);
  }

  async findByTaskIds(taskIds: readonly string[]): Promise<Comment[]> {
    const wanted = new Set(taskIds);
    return [...this.items.values()].filter((c) => wanted.has(c.taskId));
  }
}
