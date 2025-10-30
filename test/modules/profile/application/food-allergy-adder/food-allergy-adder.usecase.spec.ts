import { AllergyAdderUseCase } from '@modules/profile/application/allergy-adder/allergy-adder.usecase';
import { FoodRatingRepository } from '@modules/profile/domain/repositories/food-rating.repository';
import { Allergy } from '@modules/profile/domain/entities/allergy';
import { Food } from '@modules/profile/domain/entities/food';
import { Test } from '@nestjs/testing';

describe('AllergyAdderUseCase', () => {
  let useCase: AllergyAdderUseCase;
  let foodRatingRepository: FoodRatingRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AllergyAdderUseCase,
        {
          provide: 'FoodRatingRepository',
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<AllergyAdderUseCase>(AllergyAdderUseCase);
    foodRatingRepository = module.get<FoodRatingRepository>(
      'FoodRatingRepository',
    );
  });

  it('should save a food allergy as a FoodRating (score 0)', async () => {
    const input = {
      userId: 'user-1',
      foodName: 'Peanuts',
    };

    await useCase.execute(input);

    expect(foodRatingRepository.save).toHaveBeenCalledWith(
      Allergy.create(input.userId, Food.create(input.foodName)),
    );
  });
});
