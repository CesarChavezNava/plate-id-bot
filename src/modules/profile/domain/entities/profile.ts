import { FoodAllergy } from './food-allergy';
import { FoodRating } from './food-rating';

export class Profile {
  constructor(
    public readonly userId: string,
    public readonly food: FoodRating[],
    public readonly allergies: FoodAllergy[],
  ) {}
}
