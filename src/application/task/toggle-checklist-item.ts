import type { Task } from "../../domain/task";
import { TaskNotFoundError } from "../errors";
import type { TaskRepository } from "../ports";

/** Marca/desmarca um item. Marcar todos NÃO conclui a tarefa. */
export class ToggleChecklistItem {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(input: { taskId: string; itemId: string }): Promise<Task> {
    const task = await this.tasks.findById(input.taskId);
    if (!task) {
      throw new TaskNotFoundError(`Tarefa não encontrada: "${input.taskId}".`);
    }
    const updated = task.toggleChecklistItem(input.itemId);
    await this.tasks.save(updated);
    return updated;
  }
}
