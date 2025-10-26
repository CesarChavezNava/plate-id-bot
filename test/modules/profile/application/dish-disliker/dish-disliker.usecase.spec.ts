import { DishDislikerUseCase } from '@modules/profile/application/dish-disliker/dish-disliker.usecase';
import { FoodRatingRepository } from '@modules/profile/domain/repositories/food-rating.repository';
import { FoodRating } from '@modules/profile/domain/entities/food-rating';
import { Test } from '@nestjs/testing';

describe('DishDislikerUseCase', () => {
  let useCase: DishDislikerUseCase;
  let foodRatingRepository: FoodRatingRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DishDislikerUseCase,
        {
          provide: 'FoodRatingRepository',
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DishDislikerUseCase>(DishDislikerUseCase);
    foodRatingRepository = module.get<FoodRatingRepository>(
      'FoodRatingRepository',
    );
  });

  it('should save a dislike food rating', async () => {
    const input = {
      userId: 'user-1',
      foodName: 'Pizza',
    };

    await useCase.execute(input);

    expect(foodRatingRepository.save).toHaveBeenCalledWith(
      new FoodRating(input.userId, input.foodName, 'dislike'),
    );
  });
});
