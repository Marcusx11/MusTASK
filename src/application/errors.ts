import { DomainError } from "../domain/errors";

export class CategoryNotFoundError extends DomainError {}

export class WeekAlreadyExistsError extends DomainError {}
