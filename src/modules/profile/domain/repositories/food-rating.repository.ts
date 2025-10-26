import { FoodRating } from '@modules/profile/domain/entities/food-rating';
import { FoodRatingCriteria } from '../entities/food-rating-criteria';

export interface FoodRatingRepository {
  save(food: FoodRating): Promise<void>;
  search(criteria: FoodRatingCriteria): Promise<FoodRating[]>;
}
