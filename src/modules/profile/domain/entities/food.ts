import { StringUtils } from '@modules/shared/domain/utils/string.utils';
import { generateFoodId } from '../utils/id-generator.utils';

export class Food {
  private constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}

  static create(name: string): Food {
    const id = generateFoodId(name);
    name = StringUtils.toPascalCaseWithSpaces(name);

    return new Food(id, name);
  }

  static new(id: string, name: string): Food {
    return new Food(id, name);
  }
}
