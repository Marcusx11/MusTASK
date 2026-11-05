// Portas de saída: o que a aplicação precisa do mundo externo.
// Só interfaces — as implementações ficam em src/adapters.
import type { Allocation } from "../domain/allocation";
import type { Category } from "../domain/category";
import type { LocalDate } from "../domain/local-date";
import type { Period } from "../domain/period";
import type { Task } from "../domain/task";
import type { Week } from "../domain/week";

export interface CategoryRepository {
  save(category: Category): Promise<void>;
  findById(id: string): Promise<Category | undefined>;
}

export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | undefined>;
  findBacklog(): Promise<Task[]>;
}

export interface WeekRepository {
  save(week: Week): Promise<void>;
  findById(id: string): Promise<Week | undefined>;
  findByMonday(monday: LocalDate): Promise<Week | undefined>;
}

export interface PeriodRepository {
  save(period: Period): Promise<void>;
  saveAll(periods: Period[]): Promise<void>;
  findById(id: string): Promise<Period | undefined>;
  findAll(): Promise<Period[]>;
}

export interface AllocationRepository {
  save(allocation: Allocation): Promise<void>;
  findByWeek(weekId: string): Promise<Allocation[]>;
}

/** Fonte do "hoje". Em testes, um relógio fixo. */
export interface Clock {
  today(): LocalDate;
}

export interface IdGenerator {
  next(): string;
}
