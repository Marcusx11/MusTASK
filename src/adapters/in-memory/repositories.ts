import type { CategoryRepository, TaskRepository, WeekRepository } from "../../application/ports";
import type { Category } from "../../domain/category";
import type { LocalDate } from "../../domain/local-date";
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
}

export class InMemoryWeekRepository implements WeekRepository {
  readonly items = new Map<string, Week>();

  async save(week: Week): Promise<void> {
    this.items.set(week.id, week);
  }

  async findByMonday(monday: LocalDate): Promise<Week | undefined> {
    return [...this.items.values()].find((w) => w.monday.equals(monday));
  }
}
