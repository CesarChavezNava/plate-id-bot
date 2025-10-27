import { AllergyAdderUseCase } from './allergy-adder/allergy-adder.usecase';
import { FoodRaterUseCase } from './food-rater/food-rater.usecase';
import { ProfileFinderUseCase } from './profile-finder/profile-finder.usecase';
import { RatedFoodSearcherUseCase } from './rated-food-searcher/rated-food-searcher.usecase';

export const usesCases = [
  FoodRaterUseCase,
  AllergyAdderUseCase,
  ProfileFinderUseCase,
  RatedFoodSearcherUseCase,
];
