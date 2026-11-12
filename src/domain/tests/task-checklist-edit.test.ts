import { describe, expect, it } from "vitest";
import {
  ChecklistItemNotFoundError,
  InvalidChecklistItemError,
  TaskAlreadyCompletedError,
} from "../errors";
import { LocalDate } from "../local-date";
import { Task } from "../task";

const withTwoItems = () =>
  Task.create({ id: "t1", title: "Migrar banco", categoryId: "c1", size: "long" })
    .addChecklistItem("i1", "Backup")
    .addChecklistItem("i2", "Rodar migração")
    .toggleChecklistItem("i1");

describe("Task: editar e remover itens do checklist", () => {
  it("edita o texto mantendo a marcação e a ordem", () => {
    const task = withTwoItems().editChecklistItem("i1", "  Backup completo ");
    expect(task.checklist).toEqual([
      { id: "i1", text: "Backup completo", done: true },
      { id: "i2", text: "Rodar migração", done: false },
    ]);
  });

  it("remove o item e atualiza o progresso", () => {
    const task = withTwoItems().removeChecklistItem("i1");
    expect(task.checklist.map((i) => i.id)).toEqual(["i2"]);
    expect(task.checklistProgress).toEqual({ done: 0, total: 1 });
  });

  it("rejeita texto vazio e item inexistente", () => {
    expect(() => withTwoItems().editChecklistItem("i1", " ")).toThrow(InvalidChecklistItemError);
    expect(() => withTwoItems().editChecklistItem("x", "a")).toThrow(ChecklistItemNotFoundError);
    expect(() => withTwoItems().removeChecklistItem("x")).toThrow(ChecklistItemNotFoundError);
  });

  it("bloqueia editar e remover em tarefa concluída", () => {
    const today = LocalDate.parse("2026-11-12");
    const done = withTwoItems().complete(today, today);
    expect(() => done.editChecklistItem("i1", "Outro")).toThrow(TaskAlreadyCompletedError);
    expect(() => done.removeChecklistItem("i1")).toThrow(TaskAlreadyCompletedError);
  });
});
