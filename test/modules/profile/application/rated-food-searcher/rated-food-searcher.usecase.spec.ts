import { RatedFoodSearcherUseCase } from '@modules/profile/application/rated-food-searcher/rated-food-searcher.usecase';
import { FoodRatingRepository } from '@modules/profile/domain/repositories/food-rating.repository';
import { FoodRating } from '@modules/profile/domain/entities/food-rating';
import { FoodRatingCriteria } from '@modules/profile/domain/entities/food-rating-criteria';
import { Test } from '@nestjs/testing';

describe('RatedFoodSearcherUseCase', () => {
  let useCase: RatedFoodSearcherUseCase;
  let foodRatingRepository: FoodRatingRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RatedFoodSearcherUseCase,
        {
          provide: 'FoodRatingRepository',
          useValue: {
            search: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RatedFoodSearcherUseCase>(RatedFoodSearcherUseCase);
    foodRatingRepository = module.get<FoodRatingRepository>(
      'FoodRatingRepository',
    );
  });

  it('should search for liked dishes', async () => {
    const input = { userId: 'user-1', rating: 'likes' as const };
    const expectedRatings = [new FoodRating('user-1', 'Pizza', 'like')];

    (foodRatingRepository.search as jest.Mock).mockResolvedValue(
      expectedRatings,
    );

    const result = await useCase.execute(input);

    expect(foodRatingRepository.search).toHaveBeenCalledWith(
      new FoodRatingCriteria(input.userId, 'like'),
    );
    expect(result).toEqual(expectedRatings);
  });

  it('should search for disliked dishes', async () => {
    const input = { userId: 'user-1', rating: 'dislikes' as const };
    const expectedRatings = [new FoodRating('user-1', 'Broccoli', 'dislike')];

    (foodRatingRepository.search as jest.Mock).mockResolvedValue(
      expectedRatings,
    );

    const result = await useCase.execute(input);

    expect(foodRatingRepository.search).toHaveBeenCalledWith(
      new FoodRatingCriteria(input.userId, 'dislike'),
    );
    expect(result).toEqual(expectedRatings);
  });
});
