import type { Task } from "../../domain/task";
import { TaskNotFoundError } from "../errors";
import type { IdGenerator, TaskRepository } from "../ports";

export class AddChecklistItem {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: { taskId: string; text: string }): Promise<Task> {
    const task = await this.tasks.findById(input.taskId);
    if (!task) {
      throw new TaskNotFoundError(`Tarefa não encontrada: "${input.taskId}".`);
    }
    const updated = task.addChecklistItem(this.ids.next(), input.text);
    await this.tasks.save(updated);
    return updated;
  }
}
