import { FoodAllergyAdderUseCase } from '@modules/profile/application/food-allergy-adder/food-allergy-adder.usecase';
import { FoodAllergyRepository } from '@modules/profile/domain/repositories/food-allergy.repository';
import { FoodAllergy } from '@modules/profile/domain/entities/food-allergy';
import { Test } from '@nestjs/testing';

describe('FoodAllergyAdderUseCase', () => {
  let useCase: FoodAllergyAdderUseCase;
  let foodAllergyRepository: FoodAllergyRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FoodAllergyAdderUseCase,
        {
          provide: 'FoodAllergyRepository',
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<FoodAllergyAdderUseCase>(FoodAllergyAdderUseCase);
    foodAllergyRepository = module.get<FoodAllergyRepository>(
      'FoodAllergyRepository',
    );
  });

  it('should save a food allergy', async () => {
    const input = {
      userId: 'user-1',
      foodName: 'Peanuts',
    };

    await useCase.execute(input);

    expect(foodAllergyRepository.add).toHaveBeenCalledWith(
      new FoodAllergy(input.userId, input.foodName),
    );
  });
});
