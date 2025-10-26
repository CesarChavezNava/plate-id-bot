import { FoodAllergy } from '@modules/profile/domain/entities/food-allergy';
import { FoodAllergyCriteria } from '../entities/food-allergy-criteria';

export interface FoodAllergyRepository {
  add(allergy: FoodAllergy): Promise<void>;
  search(criteria: FoodAllergyCriteria): Promise<FoodAllergy[]>;
}
