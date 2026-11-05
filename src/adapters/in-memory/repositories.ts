import type {
  AllocationRepository,
  CategoryRepository,
  PeriodRepository,
  TaskRepository,
  WeekRepository,
} from "../../application/ports";
import type { Allocation } from "../../domain/allocation";
import type { Category } from "../../domain/category";
import type { LocalDate } from "../../domain/local-date";
import type { Period } from "../../domain/period";
import type { Task } from "../../domain/task";
import type { Week } from "../../domain/week";

export class InMemoryCategoryRepository implements CategoryRepository {
  readonly items = new Map<string, Category>();

  async save(category: Category): Promise<void> {
    this.items.set(category.id, category);
  }

  async findById(id: string): Promise<Category | undefined> {
    return this.items.get(id);
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

  async findByWeek(weekId: string): Promise<Allocation[]> {
    return [...this.items.values()].filter((a) => a.weekId === weekId);
  }
}
