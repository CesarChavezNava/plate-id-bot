import { FoodAllergy } from '@modules/profile/domain/entities/food-allergy';
import { FoodAllergyRepository } from '@modules/profile/domain/repositories/food-allergy.repository';
import { Inject, Injectable } from '@nestjs/common';
import { FoodAllergiesSearcherInput } from './food-allergies-searcher.input';
import { FoodAllergyCriteria } from '@modules/profile/domain/entities/food-allergy-criteria';

@Injectable()
export class FoodAllergiesSearcherUseCase {
  constructor(
    @Inject('FoodAllergyRepository')
    private readonly foodAllergyRepository: FoodAllergyRepository,
  ) {}

  async execute(input: FoodAllergiesSearcherInput): Promise<FoodAllergy[]> {
    return await this.foodAllergyRepository.search(
      new FoodAllergyCriteria(input.userId),
    );
  }
}
