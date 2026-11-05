import type { LocalDate } from "../../domain/local-date";
import type { Task } from "../../domain/task";
import { TaskNotFoundError } from "../errors";
import type { Clock, TaskRepository } from "../ports";

/** Conclui a tarefa inteira na data informada (ou hoje). Ela sai do backlog. */
export class CompleteTask {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: { taskId: string; date?: LocalDate | undefined }): Promise<Task> {
    const task = await this.tasks.findById(input.taskId);
    if (!task) {
      throw new TaskNotFoundError(`Tarefa não encontrada: "${input.taskId}".`);
    }

    const today = this.clock.today();
    const completed = task.complete(input.date ?? today, today);

    await this.tasks.save(completed);
    return completed;
  }
}
