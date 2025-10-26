import { DishLikerUseCase } from '@modules/profile/application/dish-liker/dish-liker.usecase';
import { FoodRatingRepository } from '@modules/profile/domain/repositories/food-rating.repository';
import { FoodRating } from '@modules/profile/domain/entities/food-rating';
import { Test } from '@nestjs/testing';

describe('DishLikerUseCase', () => {
  let useCase: DishLikerUseCase;
  let foodRatingRepository: FoodRatingRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DishLikerUseCase,
        {
          provide: 'FoodRatingRepository',
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DishLikerUseCase>(DishLikerUseCase);
    foodRatingRepository = module.get<FoodRatingRepository>(
      'FoodRatingRepository',
    );
  });

  it('should save a like food rating', async () => {
    const input = {
      userId: 'user-1',
      foodName: 'Burger',
    };

    await useCase.execute(input);

    expect(foodRatingRepository.save).toHaveBeenCalledWith(
      new FoodRating(input.userId, input.foodName, 'like'),
    );
  });
});
