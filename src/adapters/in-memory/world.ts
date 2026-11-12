// "Composition root" em memória: monta repositórios + casos de uso prontos para uso.
// Serve para testes hoje; o main do Electron fará o mesmo com os adaptadores reais.
import { AllocateTask } from "../../application/allocation/allocate-task";
import { MoveAllocation } from "../../application/allocation/move-allocation";
import { CreateCategory } from "../../application/category/create-category";
import { AddComment } from "../../application/comment/add-comment";
import { EditComment } from "../../application/comment/edit-comment";
import { RemoveComment } from "../../application/comment/remove-comment";
import { CreatePeriod } from "../../application/period/create-period";
import { ReorderPeriods } from "../../application/period/reorder-periods";
import { AddChecklistItem } from "../../application/task/add-checklist-item";
import { CompleteTask } from "../../application/task/complete-task";
import { CreateTask } from "../../application/task/create-task";
import { EditChecklistItem } from "../../application/task/edit-checklist-item";
import { RemoveChecklistItem } from "../../application/task/remove-checklist-item";
import { ToggleChecklistItem } from "../../application/task/toggle-checklist-item";
import { CreateWeek } from "../../application/week/create-week";
import { GetWeekPlan } from "../../application/week/get-week-plan";
import { LocalDate } from "../../domain/local-date";
import { FixedClock } from "./fixed-clock";
import {
  InMemoryAllocationRepository,
  InMemoryCategoryRepository,
  InMemoryCommentRepository,
  InMemoryPeriodRepository,
  InMemoryTaskRepository,
  InMemoryWeekRepository,
} from "./repositories";
import { SequentialIdGenerator } from "./sequential-id-generator";

export function createInMemoryWorld(today = "2026-11-12") {
  const clock = new FixedClock(LocalDate.parse(today));
  const ids = new SequentialIdGenerator();
  const repos = {
    categories: new InMemoryCategoryRepository(),
    tasks: new InMemoryTaskRepository(),
    weeks: new InMemoryWeekRepository(),
    periods: new InMemoryPeriodRepository(),
    allocations: new InMemoryAllocationRepository(),
    comments: new InMemoryCommentRepository(),
  };
  const { categories, tasks, weeks, periods, allocations, comments } = repos;

  return {
    clock,
    repos,
    createCategory: new CreateCategory(categories, ids),
    createTask: new CreateTask(tasks, categories, ids),
    completeTask: new CompleteTask(tasks, clock),
    addChecklistItem: new AddChecklistItem(tasks, ids),
    toggleChecklistItem: new ToggleChecklistItem(tasks),
    editChecklistItem: new EditChecklistItem(tasks),
    removeChecklistItem: new RemoveChecklistItem(tasks),
    addComment: new AddComment(comments, tasks, clock, ids),
    editComment: new EditComment(comments, clock),
    removeComment: new RemoveComment(comments),
    createWeek: new CreateWeek(weeks, clock, ids),
    createPeriod: new CreatePeriod(periods, ids),
    reorderPeriods: new ReorderPeriods(periods),
    allocateTask: new AllocateTask(allocations, tasks, weeks, periods, ids),
    moveAllocation: new MoveAllocation(allocations, periods),
    getWeekPlan: new GetWeekPlan(weeks, periods, allocations, tasks, categories, comments),
  };
}

export type InMemoryWorld = ReturnType<typeof createInMemoryWorld>;
