import { Allocation } from "../../domain/allocation";
import { TaskAlreadyCompletedError } from "../../domain/errors";
import { PeriodNotFoundError, TaskNotFoundError, WeekNotFoundError } from "../errors";
import type {
  AllocationRepository,
  IdGenerator,
  PeriodRepository,
  TaskRepository,
  WeekRepository,
} from "../ports";

/** Coloca uma tarefa do backlog num dia + período de uma semana existente. */
export class AllocateTask {
  constructor(
    private readonly allocations: AllocationRepository,
    private readonly tasks: TaskRepository,
    private readonly weeks: WeekRepository,
    private readonly periods: PeriodRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: {
    taskId: string;
    weekId: string;
    weekday: number;
    periodId: string;
    time?: string | undefined;
  }): Promise<Allocation> {
    const allocation = Allocation.create({ id: this.ids.next(), ...input });

    const task = await this.tasks.findById(input.taskId);
    if (!task) {
      throw new TaskNotFoundError(`Tarefa não encontrada: "${input.taskId}".`);
    }
    if (task.isCompleted) {
      throw new TaskAlreadyCompletedError(
        `A tarefa "${task.title}" já foi concluída e não pode ser alocada.`,
      );
    }
    if (!(await this.weeks.findById(input.weekId))) {
      throw new WeekNotFoundError(`Semana não encontrada: "${input.weekId}". Crie a semana antes.`);
    }
    if (!(await this.periods.findById(input.periodId))) {
      throw new PeriodNotFoundError(`Período não encontrado: "${input.periodId}".`);
    }

    await this.allocations.save(allocation);
    return allocation;
  }
}
