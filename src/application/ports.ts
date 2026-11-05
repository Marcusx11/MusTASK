// Portas de saída: o que a aplicação precisa do mundo externo.
// Só interfaces — as implementações ficam em src/adapters.
import type { Category } from "../domain/category";
import type { LocalDate } from "../domain/local-date";
import type { Task } from "../domain/task";
import type { Week } from "../domain/week";

export interface CategoryRepository {
  save(category: Category): Promise<void>;
  findById(id: string): Promise<Category | undefined>;
}

export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | undefined>;
}

export interface WeekRepository {
  save(week: Week): Promise<void>;
  findByMonday(monday: LocalDate): Promise<Week | undefined>;
}

/** Fonte do "hoje". Em testes, um relógio fixo. */
export interface Clock {
  today(): LocalDate;
}

export interface IdGenerator {
  next(): string;
}
