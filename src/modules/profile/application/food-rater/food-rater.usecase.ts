import { Food } from '@modules/profile/domain/entities/food';
import { FoodRating } from '@modules/profile/domain/entities/food-rating';
import { FoodRatingRepository } from '@modules/profile/domain/repositories/food-rating.repository';
import { Inject, Injectable } from '@nestjs/common';
import { FoodRaterInput } from './food-rater.input';

@Injectable()
export class FoodRaterUseCase {
  constructor(
    @Inject('FoodRatingRepository')
    private readonly foodRatingRepository: FoodRatingRepository,
  ) {}

  async execute(input: FoodRaterInput): Promise<void> {
    await this.foodRatingRepository.save(
      FoodRating.create(input.userId, input.score, Food.create(input.foodName)),
    );
  }
}
