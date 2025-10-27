import { Food } from './food';
import { FoodRating } from './food-rating';

export class Allergy {
  private constructor() {}

  static create(userId: string, food: Food): FoodRating {
    return FoodRating.create(userId, 0, food);
  }
}
