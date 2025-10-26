import { Inject, Injectable } from '@nestjs/common';
import { DishLikerInput } from '@modules/profile/application/dish-liker/dish-liker.input';
import { FoodRatingRepository } from '@modules/profile/domain/repositories/food-rating.repository';
import { FoodRating } from '@modules/profile/domain/entities/food-rating';

@Injectable()
export class DishLikerUseCase {
  constructor(
    @Inject('FoodRatingRepository')
    private readonly foodRatingRepository: FoodRatingRepository,
  ) {}

  async execute(input: DishLikerInput) {
    await this.foodRatingRepository.save(
      new FoodRating(input.userId, input.foodName, 'like'),
    );
  }
}
