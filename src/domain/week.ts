import type { LocalDate } from "./local-date";

/**
 * Semana de segunda a domingo: o registro das atividades daquela semana.
 * Identificada pela data da sua segunda-feira.
 */
export class Week {
  private constructor(
    readonly id: string,
    readonly monday: LocalDate,
  ) {}

  /** Cria a semana que contém a data informada (nunca a semana seguinte). */
  static containing(props: { id: string; date: LocalDate }): Week {
    return new Week(props.id, props.date.startOfWeek());
  }

  /** Os 7 dias, de segunda (índice 0) a domingo (índice 6). */
  get days(): LocalDate[] {
    return Array.from({ length: 7 }, (_, i) => this.monday.plusDays(i));
  }

  contains(date: LocalDate): boolean {
    return date.startOfWeek().equals(this.monday);
  }
}
