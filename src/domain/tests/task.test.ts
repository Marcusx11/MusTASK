import { describe, expect, it } from "vitest";
import { InvalidTaskError } from "../errors";
import { Task } from "../task";

const valid = { id: "t1", title: "Revisar PR", categoryId: "c1", size: "quick" };

describe("Task", () => {
  it("cria uma tarefa válida e remove espaços do título", () => {
    const task = Task.create({ ...valid, title: "  Revisar PR  " });
    expect(task.title).toBe("Revisar PR");
    expect(task.size).toBe("quick");
  });

  it("exige título", () => {
    expect(() => Task.create({ ...valid, title: "   " })).toThrow(InvalidTaskError);
  });

  it("exige categoria", () => {
    expect(() => Task.create({ ...valid, categoryId: "" })).toThrow(InvalidTaskError);
  });

  it("exige um tamanho válido", () => {
    expect(() => Task.create({ ...valid, size: "" })).toThrow(InvalidTaskError);
    expect(() => Task.create({ ...valid, size: "huge" })).toThrow(InvalidTaskError);
  });
});
