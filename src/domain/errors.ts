/** Base de todos os erros de regra de negócio. */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidDateError extends DomainError {}

export class InvalidCategoryError extends DomainError {}

export class InvalidTaskError extends DomainError {}
