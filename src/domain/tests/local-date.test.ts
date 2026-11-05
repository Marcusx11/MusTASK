import { describe, expect, it } from "vitest";
import { InvalidDateError } from "../errors";
import { LocalDate } from "../local-date";

describe("LocalDate", () => {
  it("lê e escreve no formato AAAA-MM-DD", () => {
    expect(LocalDate.parse("2026-11-05").toString()).toBe("2026-11-05");
  });

  it("rejeita datas que não existem", () => {
    expect(() => LocalDate.parse("2026-02-30")).toThrow(InvalidDateError);
    expect(() => LocalDate.parse("05/11/2026")).toThrow(InvalidDateError);
  });

  it("calcula o dia da semana ISO (1 = segunda, 7 = domingo)", () => {
    expect(LocalDate.parse("2026-11-02").isoDayOfWeek).toBe(1); // segunda
    expect(LocalDate.parse("2026-11-05").isoDayOfWeek).toBe(4); // quinta
    expect(LocalDate.parse("2026-11-08").isoDayOfWeek).toBe(7); // domingo
  });

  it("encontra a segunda-feira da semana, inclusive cruzando mês e ano", () => {
    expect(LocalDate.parse("2026-11-05").startOfWeek().toString()).toBe("2026-11-02");
    expect(LocalDate.parse("2026-11-01").startOfWeek().toString()).toBe("2026-10-26");
    expect(LocalDate.parse("2027-01-01").startOfWeek().toString()).toBe("2026-12-28");
  });
});
