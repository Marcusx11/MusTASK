import type { IdGenerator } from "../../application/ports";

/** Gera "id-1", "id-2", ... para testes determinísticos. */
export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;

  constructor(private readonly prefix = "id") {}

  next(): string {
    this.counter += 1;
    return `${this.prefix}-${this.counter}`;
  }
}
