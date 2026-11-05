import { beforeEach, describe, expect, it } from "vitest";
import {
  InMemoryCategoryRepository,
  InMemoryTaskRepository,
} from "../../../adapters/in-memory/repositories";
import { SequentialIdGenerator } from "../../../adapters/in-memory/sequential-id-generator";
import { InvalidCategoryError, InvalidTaskError } from "../../../domain/errors";
import { CreateCategory } from "../../category/create-category";
import { CreateTask } from "../create-task";
import { CategoryNotFoundError } from "../../errors";

describe("CreateCategory + CreateTask", () => {
  let categories: InMemoryCategoryRepository;
  let tasks: InMemoryTaskRepository;
  let createCategory: CreateCategory;
  let createTask: CreateTask;

  beforeEach(() => {
    categories = new InMemoryCategoryRepository();
    tasks = new InMemoryTaskRepository();
    createCategory = new CreateCategory(categories, new SequentialIdGenerator("cat"));
    createTask = new CreateTask(tasks, categories, new SequentialIdGenerator("task"));
  });

  it("cria uma categoria do usuário", async () => {
    const category = await createCategory.execute({ name: " Trabalho " });
    expect(category).toMatchObject({ id: "cat-1", name: "Trabalho" });
    expect(categories.items.has("cat-1")).toBe(true);
  });

  it("rejeita categoria sem nome", async () => {
    await expect(createCategory.execute({ name: "" })).rejects.toThrow(InvalidCategoryError);
  });

  it("cria uma tarefa no backlog com categoria existente", async () => {
    const work = await createCategory.execute({ name: "Trabalho" });
    const task = await createTask.execute({
      title: "Revisar PR",
      categoryId: work.id,
      size: "medium",
    });

    expect(task).toMatchObject({ id: "task-1", categoryId: "cat-1", size: "medium" });
    expect(tasks.items.get("task-1")).toBe(task);
  });

  it("rejeita categoria inexistente e não salva nada", async () => {
    await expect(
      createTask.execute({ title: "Revisar PR", categoryId: "nao-existe", size: "quick" }),
    ).rejects.toThrow(CategoryNotFoundError);
    expect(tasks.items.size).toBe(0);
  });

  it("rejeita tarefa inválida antes de consultar categorias", async () => {
    await expect(
      createTask.execute({ title: "", categoryId: "cat-1", size: "quick" }),
    ).rejects.toThrow(InvalidTaskError);
  });
});
