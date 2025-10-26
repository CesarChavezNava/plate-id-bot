import { FoodRatingRepository } from '@modules/profile/domain/repositories/food-rating.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DishDislikerInput } from '@modules/profile/application/dish-disliker/dish-disliker.input';
import { FoodRating } from '@modules/profile/domain/entities/food-rating';

@Injectable()
export class DishDislikerUseCase {
  constructor(
    @Inject('FoodRatingRepository')
    private readonly foodRatingRepository: FoodRatingRepository,
  ) {}

  async execute(input: DishDislikerInput) {
    await this.foodRatingRepository.save(
      new FoodRating(input.userId, input.foodName, 'dislike'),
    );
  }
}
