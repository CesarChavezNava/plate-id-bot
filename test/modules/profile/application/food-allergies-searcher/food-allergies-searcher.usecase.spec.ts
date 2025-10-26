import { FoodAllergiesSearcherUseCase } from '@modules/profile/application/food-allergies-searcher/food-allergies-searcher.usecase';
import { FoodAllergyRepository } from '@modules/profile/domain/repositories/food-allergy.repository';
import { FoodAllergy } from '@modules/profile/domain/entities/food-allergy';
import { FoodAllergyCriteria } from '@modules/profile/domain/entities/food-allergy-criteria';
import { Test } from '@nestjs/testing';

describe('FoodAllergiesSearcherUseCase', () => {
  let useCase: FoodAllergiesSearcherUseCase;
  let foodAllergyRepository: FoodAllergyRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FoodAllergiesSearcherUseCase,
        {
          provide: 'FoodAllergyRepository',
          useValue: {
            search: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<FoodAllergiesSearcherUseCase>(
      FoodAllergiesSearcherUseCase,
    );
    foodAllergyRepository = module.get<FoodAllergyRepository>(
      'FoodAllergyRepository',
    );
  });

  it('should search for food allergies and return them', async () => {
    const input = { userId: 'user-1' };
    const expectedAllergies = [
      new FoodAllergy('user-1', 'Peanuts'),
      new FoodAllergy('user-1', 'Shellfish'),
    ];

    (foodAllergyRepository.search as jest.Mock).mockResolvedValue(
      expectedAllergies,
    );

    const result = await useCase.execute(input);

    expect(foodAllergyRepository.search).toHaveBeenCalledWith(
      new FoodAllergyCriteria(input.userId),
    );
    expect(result).toEqual(expectedAllergies);
  });
});
