import { DishDislikerUseCase } from './dish-disliker/dish-disliker.usecase';
import { DishLikerUseCase } from './dish-liker/dish-liker.usecase';
import { FoodAllergiesSearcherUseCase } from './food-allergies-searcher/food-allergies-searcher.usecase';
import { FoodAllergyAdderUseCase } from './food-allergy-adder/food-allergy-adder.usecase';
import { ProfileFinderUseCase } from './profile-finder/profile-finder.usecase';
import { RatedFoodSearcherUseCase } from './rated-food-searcher/rated-food-searcher.usecase';

export const usesCases = [
  DishLikerUseCase,
  DishDislikerUseCase,
  FoodAllergiesSearcherUseCase,
  FoodAllergyAdderUseCase,
  ProfileFinderUseCase,
  RatedFoodSearcherUseCase,
];
