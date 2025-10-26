import { FoodAllergyRepository } from '@modules/profile/domain/repositories/food-allergy.repository';
import { Inject, Injectable } from '@nestjs/common';
import { FoodAllergyAdderInput } from '@modules/profile/application/food-allergy-adder/food-allergy-adder.input';
import { FoodAllergy } from '@modules/profile/domain/entities/food-allergy';

@Injectable()
export class FoodAllergyAdderUseCase {
  constructor(
    @Inject('FoodAllergyRepository')
    private readonly foodAllergyRepository: FoodAllergyRepository,
  ) {}

  async execute(input: FoodAllergyAdderInput): Promise<void> {
    await this.foodAllergyRepository.add(
      new FoodAllergy(input.userId, input.foodName),
    );
  }
}
