import { describe, expect, it } from "vitest";
import { InvalidCompletionDateError, TaskAlreadyCompletedError } from "../errors";
import { LocalDate } from "../local-date";
import { Task } from "../task";

const today = LocalDate.parse("2026-11-05"); // quinta
const newTask = () => Task.create({ id: "t1", title: "Ler capítulo", categoryId: "c1", size: "medium" });

describe("Task.complete", () => {
  it("tarefa nova não está concluída", () => {
    expect(newTask().isCompleted).toBe(false);
    expect(newTask().completedAt).toBeUndefined();
  });

  it("conclui hoje", () => {
    const done = newTask().complete(today, today);
    expect(done.isCompleted).toBe(true);
    expect(done.completedAt?.toString()).toBe("2026-11-05");
  });

  it("conclui numa data passada (ex.: feito na segunda, marcado na quinta)", () => {
    const done = newTask().complete(LocalDate.parse("2026-11-02"), today);
    expect(done.completedAt?.toString()).toBe("2026-11-02");
  });

  it("devolve uma cópia: o original continua no backlog", () => {
    const original = newTask();
    original.complete(today, today);
    expect(original.isCompleted).toBe(false);
  });

  it("rejeita data futura", () => {
    expect(() => newTask().complete(LocalDate.parse("2026-11-06"), today)).toThrow(
      InvalidCompletionDateError,
    );
  });

  it("não conclui duas vezes (não sobrescreve a data original)", () => {
    const done = newTask().complete(LocalDate.parse("2026-11-02"), today);
    expect(() => done.complete(today, today)).toThrow(TaskAlreadyCompletedError);
  });
});
