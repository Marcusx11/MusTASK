import { DomainError } from "../domain/errors";

export class CategoryNotFoundError extends DomainError {}

export class TaskNotFoundError extends DomainError {}

export class WeekNotFoundError extends DomainError {}

export class PeriodNotFoundError extends DomainError {}

export class WeekAlreadyExistsError extends DomainError {}

export class InvalidPeriodOrderError extends DomainError {}
