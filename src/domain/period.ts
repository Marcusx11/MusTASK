import { InvalidPeriodError } from "./errors";

/**
 * Divisão do dia definida pelo usuário (ex.: "Início da manhã").
 * Global: vale para todos os dias. A posição define a ordem de exibição
 * e não se repete entre períodos (garantido pelos casos de uso).
 */
export class Period {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly position: number,
  ) {}

  static create(props: { id: string; name: string; position: number }): Period {
    const name = props.name.trim();
    if (!name) {
      throw new InvalidPeriodError("O período precisa de um nome.");
    }
    if (!Number.isInteger(props.position) || props.position < 1) {
      throw new InvalidPeriodError(`Posição inválida: ${props.position}. Use um inteiro a partir de 1.`);
    }
    return new Period(props.id, name, props.position);
  }

  /** Mesmo período em outra posição (entidades imutáveis: devolve uma cópia). */
  withPosition(position: number): Period {
    return Period.create({ id: this.id, name: this.name, position });
  }
}
