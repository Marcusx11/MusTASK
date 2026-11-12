import { InvalidAllocationError } from "./errors";
import { TimeOfDay } from "./time-of-day";

/** Dia da semana ISO: 1 = segunda ... 7 = domingo. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function isWeekday(value: unknown): value is Weekday {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 7;
}

/**
 * O plano: "vou trabalhar na tarefa X na semana W, no dia D, no período P".
 * É o card do Kanban. `position` é a ordem do card dentro da célula (dia + período),
 * definida pelo usuário ao arrastar — o horário não interfere na ordem.
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
    readonly position: number,
    readonly time: TimeOfDay | undefined,
  ) {}

  static create(props: {
    id: string;
    taskId: string;
    weekId: string;
    weekday: number;
    periodId: string;
    position: number;
    time?: string | undefined;
  }): Allocation {
    if (!isWeekday(props.weekday)) {
      throw new InvalidAllocationError(
        `Dia da semana inválido: ${props.weekday}. Use 1 (segunda) a 7 (domingo).`,
      );
    }
    assertPosition(props.position);
    const time = props.time === undefined ? undefined : TimeOfDay.parse(props.time);
    return new Allocation(
      props.id,
      props.taskId,
      props.weekId,
      props.weekday,
      props.periodId,
      props.position,
      time,
    );
  }

  /** Está na célula (dia + período) informada? */
  isIn(weekday: Weekday, periodId: string): boolean {
    return this.weekday === weekday && this.periodId === periodId;
  }

  /** Cópia em outra célula e/ou posição (a semana nunca muda). */
  moveTo(target: { weekday: Weekday; periodId: string; position: number }): Allocation {
    assertPosition(target.position);
    return new Allocation(
      this.id,
      this.taskId,
      this.weekId,
      target.weekday,
      target.periodId,
      target.position,
      this.time,
    );
  }

  withPosition(position: number): Allocation {
    return this.moveTo({ weekday: this.weekday, periodId: this.periodId, position });
  }
}

function assertPosition(position: number): void {
  if (!Number.isInteger(position) || position < 1) {
    throw new InvalidAllocationError(`Posição inválida: ${position}. Use um inteiro a partir de 1.`);
  }
}
