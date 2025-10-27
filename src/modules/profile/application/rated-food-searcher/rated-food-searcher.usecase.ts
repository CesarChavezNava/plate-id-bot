import { FoodRating } from '@modules/profile/domain/entities/food-rating';
import { FoodRatingCriteria } from '@modules/profile/domain/entities/food-rating-criteria';
import { FoodRatingRepository } from '@modules/profile/domain/repositories/food-rating.repository';
import { Inject, Injectable } from '@nestjs/common';
import { RatedFoodSearcherInput } from '@modules/profile/application/rated-food-searcher/rated-food-searcher.input';

@Injectable()
export class RatedFoodSearcherUseCase {
  constructor(
    @Inject('FoodRatingRepository')
    private readonly foodRatingRepository: FoodRatingRepository,
  ) {}

  async execute(input: RatedFoodSearcherInput): Promise<FoodRating[]> {
    return await this.foodRatingRepository.search(
      new FoodRatingCriteria(input.userId, input.allergies),
    );
  }
}
