import { Comment } from "../../domain/comment";
import { TaskNotFoundError } from "../errors";
import type { Clock, CommentRepository, IdGenerator, TaskRepository } from "../ports";

/** Comenta numa tarefa (inclusive concluída). A data vem do Clock. */
export class AddComment {
  constructor(
    private readonly comments: CommentRepository,
    private readonly tasks: TaskRepository,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: { taskId: string; text: string }): Promise<Comment> {
    const comment = Comment.create({
      id: this.ids.next(),
      taskId: input.taskId,
      text: input.text,
      createdAt: this.clock.today(),
    });
    if (!(await this.tasks.findById(input.taskId))) {
      throw new TaskNotFoundError(`Tarefa não encontrada: "${input.taskId}".`);
    }
    await this.comments.save(comment);
    return comment;
  }
}
