/** Base de todos os erros de regra de negócio. */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidDateError extends DomainError {}

export class InvalidTimeError extends DomainError {}

export class InvalidCategoryError extends DomainError {}

export class InvalidTaskError extends DomainError {}

export class TaskAlreadyCompletedError extends DomainError {}

export class InvalidCompletionDateError extends DomainError {}

export class InvalidPeriodError extends DomainError {}

export class InvalidAllocationError extends DomainError {}

export class InvalidChecklistItemError extends DomainError {}

export class ChecklistItemNotFoundError extends DomainError {}

export class InvalidCommentError extends DomainError {}
