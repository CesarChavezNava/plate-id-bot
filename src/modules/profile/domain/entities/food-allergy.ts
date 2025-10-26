import { generateFoodId } from '../utils/id-generator.utils';

export class FoodAllergy {
  public readonly allergyId: string;
  constructor(
    public readonly userId: string,
    public readonly foodName: string,
  ) {
    this.allergyId = generateFoodId(foodName);
  }
}
