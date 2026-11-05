import { Task } from "../../domain/task";
import { CategoryNotFoundError } from "../errors";
import type { CategoryRepository, IdGenerator, TaskRepository } from "../ports";

export class CreateTask {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly categories: CategoryRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: { title: string; categoryId: string; size: string }): Promise<Task> {
    // Valida a própria tarefa primeiro (regras do domínio)...
    const task = Task.create({ id: this.ids.next(), ...input });

    const category = await this.categories.findById(task.categoryId);
    if (!category) {
      throw new CategoryNotFoundError(`Categoria não encontrada: "${task.categoryId}".`);
    }

    await this.tasks.save(task);
    return task;
  }
}
