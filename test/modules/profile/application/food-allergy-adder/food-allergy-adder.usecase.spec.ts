import { AllergyAdderUseCase } from '@modules/profile/application/allergy-adder/allergy-adder.usecase';
import { FoodAllergyRepository } from '@modules/profile/domain/repositories/food-allergy.repository';
import { Allergy } from '@modules/profile/domain/entities/allergy';
import { Test } from '@nestjs/testing';

describe('FoodAllergyAdderUseCase', () => {
  let useCase: AllergyAdderUseCase;
  let foodAllergyRepository: FoodAllergyRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AllergyAdderUseCase,
        {
          provide: 'FoodAllergyRepository',
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<AllergyAdderUseCase>(AllergyAdderUseCase);
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
      new Allergy(input.userId, input.foodName),
    );
  });
});
