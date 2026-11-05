import { InvalidAllocationError } from "./errors";
import { TimeOfDay } from "./time-of-day";

/** Dia da semana ISO: 1 = segunda ... 7 = domingo. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function isWeekday(value: unknown): value is Weekday {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 7;
}

/**
 * O plano: "vou trabalhar na tarefa X na semana W, no dia D, no período P".
 * Não tem estado de concluída — quem é concluída é a Tarefa.
 * A mesma tarefa pode ter várias alocações, inclusive no mesmo período.
 * O horário é opcional e não é validado contra o período.
 */
export class Allocation {
  private constructor(
    readonly id: string,
    readonly taskId: string,
    readonly weekId: string,
    readonly weekday: Weekday,
    readonly periodId: string,
    readonly time: TimeOfDay | undefined,
  ) {}

  static create(props: {
    id: string;
    taskId: string;
    weekId: string;
    weekday: number;
    periodId: string;
    time?: string | undefined;
  }): Allocation {
    if (!isWeekday(props.weekday)) {
      throw new InvalidAllocationError(
        `Dia da semana inválido: ${props.weekday}. Use 1 (segunda) a 7 (domingo).`,
      );
    }
    const time = props.time === undefined ? undefined : TimeOfDay.parse(props.time);
    return new Allocation(props.id, props.taskId, props.weekId, props.weekday, props.periodId, time);
  }
}
