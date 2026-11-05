import { Category } from "../../domain/category";
import type { CategoryRepository, IdGenerator } from "../ports";

export class CreateCategory {
  constructor(
    private readonly categories: CategoryRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: { name: string }): Promise<Category> {
    const category = Category.create({ id: this.ids.next(), name: input.name });
    await this.categories.save(category);
    return category;
  }
}
