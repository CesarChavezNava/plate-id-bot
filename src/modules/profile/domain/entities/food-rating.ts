import { RatingType } from '@modules/profile/domain/types/rating.type';
import { generateFoodId } from '@modules/profile/domain/utils/id-generator.utils';

export class FoodRating {
  public readonly foodId: string;
  constructor(
    public readonly userId: string,
    public readonly foodName: string,
    public readonly rating: RatingType,
  ) {
    this.foodId = generateFoodId(foodName);
  }
}
