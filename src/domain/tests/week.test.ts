import { describe, expect, it } from "vitest";
import { LocalDate } from "../local-date";
import { Week } from "../week";

describe("Week", () => {
  it("é a semana de segunda a domingo que contém a data (nunca a seguinte)", () => {
    const thursday = Week.containing({ id: "w1", date: LocalDate.parse("2026-11-05") });
    const sunday = Week.containing({ id: "w2", date: LocalDate.parse("2026-11-08") });

    expect(thursday.monday.toString()).toBe("2026-11-02");
    expect(sunday.monday.toString()).toBe("2026-11-02");
  });

  it("tem 7 dias, de segunda a domingo", () => {
    const week = Week.containing({ id: "w1", date: LocalDate.parse("2026-11-05") });
    expect(week.days.map(String)).toEqual([
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
      "2026-11-08",
    ]);
  });

  it("sabe se uma data pertence a ela", () => {
    const week = Week.containing({ id: "w1", date: LocalDate.parse("2026-11-05") });
    expect(week.contains(LocalDate.parse("2026-11-08"))).toBe(true);
    expect(week.contains(LocalDate.parse("2026-11-09"))).toBe(false);
  });
});
