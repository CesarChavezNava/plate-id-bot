import { FoodRaterUseCase } from '@modules/profile/application/food-rater/food-rater.usecase';
import { FoodRatingRepository } from '@modules/profile/domain/repositories/food-rating.repository';
import { FoodRating } from '@modules/profile/domain/entities/food-rating';
import { Food } from '@modules/profile/domain/entities/food';
import { Test } from '@nestjs/testing';

describe('FoodRaterUseCase', () => {
  let useCase: FoodRaterUseCase;
  let foodRatingRepository: FoodRatingRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FoodRaterUseCase,
        {
          provide: 'FoodRatingRepository',
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<FoodRaterUseCase>(FoodRaterUseCase);
    foodRatingRepository = module.get<FoodRatingRepository>(
      'FoodRatingRepository',
    );
  });

  it('should save a food rating with bounded score and formatted food', async () => {
    const input = { userId: 'user-1', score: 6, foodName: 'cheeseburger' };

    await useCase.execute(input as any);

    expect(foodRatingRepository.save).toHaveBeenCalledWith(
      FoodRating.create(input.userId, input.score, Food.create(input.foodName)),
    );
  });
});
