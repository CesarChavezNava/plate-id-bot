import { FoodAllergy } from '@modules/profile/domain/entities/food-allergy';
import { FoodRating } from '@modules/profile/domain/entities/food-rating';

export class ProfileFinderOutput {
  constructor(
    public readonly userId: string,
    public readonly likes: FoodRating[],
    public readonly dislikes: FoodRating[],
    public readonly allergies: FoodAllergy[],
  ) {}
}
