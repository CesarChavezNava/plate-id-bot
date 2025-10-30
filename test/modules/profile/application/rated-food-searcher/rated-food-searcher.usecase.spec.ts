import { RatedFoodSearcherUseCase } from '@modules/profile/application/rated-food-searcher/rated-food-searcher.usecase';
import { FoodRatingRepository } from '@modules/profile/domain/repositories/food-rating.repository';
import { FoodRating } from '@modules/profile/domain/entities/food-rating';
import { FoodRatingCriteria } from '@modules/profile/domain/entities/food-rating-criteria';
import { Food } from '@modules/profile/domain/entities/food';
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

  it('should search for rated dishes (no allergies filter)', async () => {
    const input = { userId: 'user-1', allergies: false };
    const expectedRatings = [
      FoodRating.new(input.userId, 5, Food.create('Pizza')),
    ];

    (foodRatingRepository.search as jest.Mock).mockResolvedValue(
      expectedRatings,
    );

    const result = await useCase.execute(input);

    expect(foodRatingRepository.search).toHaveBeenCalledWith(
      new FoodRatingCriteria(input.userId, input.allergies),
    );
    expect(result).toEqual(expectedRatings);
  });

  it('should search for rated dishes filtering by allergies', async () => {
    const input = { userId: 'user-1', allergies: true };
    const expectedRatings = [
      FoodRating.new(input.userId, 3, Food.create('Broccoli')),
    ];

    (foodRatingRepository.search as jest.Mock).mockResolvedValue(
      expectedRatings,
    );

    const result = await useCase.execute(input);

    expect(foodRatingRepository.search).toHaveBeenCalledWith(
      new FoodRatingCriteria(input.userId, input.allergies),
    );
    expect(result).toEqual(expectedRatings);
  });
});
