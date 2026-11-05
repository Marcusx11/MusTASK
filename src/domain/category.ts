import { InvalidCategoryError } from "./errors";

/** Categoria criada pelo usuário para organizar o backlog (ex.: Trabalho, Pessoal). */
export class Category {
  private constructor(
    readonly id: string,
    readonly name: string,
  ) {}

  static create(props: { id: string; name: string }): Category {
    const name = props.name.trim();
    if (!name) {
      throw new InvalidCategoryError("A categoria precisa de um nome.");
    }
    return new Category(props.id, name);
  }
}
