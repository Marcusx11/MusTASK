import { describe, expect, it } from "vitest";
import {
  ChecklistItemNotFoundError,
  InvalidChecklistItemError,
  TaskAlreadyCompletedError,
} from "../errors";
import { LocalDate } from "../local-date";
import { Task } from "../task";

const newTask = () =>
  Task.create({ id: "t1", title: "Migrar banco", categoryId: "c1", size: "long" });

describe("Task checklist", () => {
  it("começa vazio", () => {
    expect(newTask().checklist).toEqual([]);
    expect(newTask().checklistProgress).toEqual({ done: 0, total: 0 });
  });

  it("adiciona itens desmarcados, sem alterar o original", () => {
    const original = newTask();
    const task = original.addChecklistItem("i1", "  Backup  ").addChecklistItem("i2", "Rodar migração");

    expect(task.checklist).toEqual([
      { id: "i1", text: "Backup", done: false },
      { id: "i2", text: "Rodar migração", done: false },
    ]);
    expect(original.checklist).toEqual([]);
  });

  it("rejeita item sem texto", () => {
    expect(() => newTask().addChecklistItem("i1", "  ")).toThrow(InvalidChecklistItemError);
  });

  it("marca e desmarca, atualizando o progresso", () => {
    const task = newTask().addChecklistItem("i1", "Backup").addChecklistItem("i2", "Migrar");

    const marked = task.toggleChecklistItem("i1");
    expect(marked.checklistProgress).toEqual({ done: 1, total: 2 });

    const unmarked = marked.toggleChecklistItem("i1");
    expect(unmarked.checklistProgress).toEqual({ done: 0, total: 2 });
  });

  it("marcar todos os itens NÃO conclui a tarefa", () => {
    const task = newTask().addChecklistItem("i1", "Backup").toggleChecklistItem("i1");
    expect(task.checklistProgress).toEqual({ done: 1, total: 1 });
    expect(task.isCompleted).toBe(false);
  });

  it("rejeita item inexistente", () => {
    expect(() => newTask().toggleChecklistItem("x")).toThrow(ChecklistItemNotFoundError);
  });

  it("concluir mantém o checklist; depois disso ele não pode mudar", () => {
    const today = LocalDate.parse("2026-11-12");
    const done = newTask().addChecklistItem("i1", "Backup").complete(today, today);

    expect(done.checklist).toHaveLength(1);
    expect(() => done.addChecklistItem("i2", "Outro")).toThrow(TaskAlreadyCompletedError);
    expect(() => done.toggleChecklistItem("i1")).toThrow(TaskAlreadyCompletedError);
  });
});
