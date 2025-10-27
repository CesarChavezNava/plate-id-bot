import { Inject, Injectable } from '@nestjs/common';
import { AllergyAdderInput } from '@modules/profile/application/allergy-adder/allergy-adder.input';
import { Allergy } from '@modules/profile/domain/entities/allergy';
import { FoodRatingRepository } from '@modules/profile/domain/repositories/food-rating.repository';
import { Food } from '@modules/profile/domain/entities/food';

@Injectable()
export class AllergyAdderUseCase {
  constructor(
    @Inject('FoodRatingRepository')
    private readonly foodRatingRepository: FoodRatingRepository,
  ) {}

  async execute(input: AllergyAdderInput): Promise<void> {
    await this.foodRatingRepository.save(
      Allergy.create(input.userId, Food.create(input.foodName)),
    );
  }
}
