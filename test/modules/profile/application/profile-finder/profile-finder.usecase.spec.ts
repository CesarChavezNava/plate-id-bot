import { ProfileFinderUseCase } from '@modules/profile/application/profile-finder/profile-finder.usecase';
import { ProfileRepository } from '@modules/profile/domain/repositories/profile.repository';
import { Profile } from '@modules/profile/domain/entities/profile';
import { FoodRating } from '@modules/profile/domain/entities/food-rating';
import { Allergy } from '@modules/profile/domain/entities/allergy';
import { Food } from '@modules/profile/domain/entities/food';
import { ProfileNotFoundError } from '@modules/profile/domain/errors/profile-not-found.error';
import { Test } from '@nestjs/testing';

describe('ProfileFinderUseCase', () => {
  let useCase: ProfileFinderUseCase;
  let profileRepository: ProfileRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProfileFinderUseCase,
        {
          provide: 'ProfileRepository',
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ProfileFinderUseCase>(ProfileFinderUseCase);
    profileRepository = module.get<ProfileRepository>('ProfileRepository');
  });

  it('should find a profile and return its details', async () => {
    const userId = 'user-1';
    const likes = [FoodRating.new(userId, 5, Food.create('Pizza'))];
    const dislikes = [FoodRating.new(userId, 1, Food.create('Broccoli'))];
    const allergies = [Allergy.create(userId, Food.create('Peanuts'))];
    const profile = new Profile(userId, [...likes, ...dislikes], allergies);

    (profileRepository.find as jest.Mock).mockResolvedValue(profile);

    const result = await useCase.execute({ userId });

    expect(profileRepository.find).toHaveBeenCalledWith(userId);
    // current usecase returns a Profile entity
    expect(result).toBeInstanceOf(Profile);
    expect(result.userId).toBe(userId);
    // Profile stores food ratings and allergies as FoodRating arrays
    expect(result.food).toEqual([...likes, ...dislikes]);
    expect(result.allergies).toEqual(allergies);
  });

  it('should throw ProfileNotFoundError if profile is not found', async () => {
    const userId = 'non-existent-user';
    (profileRepository.find as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute({ userId })).rejects.toThrow(
      new ProfileNotFoundError(userId),
    );
  });

  it('should return empty arrays if profile has no ratings or allergies', async () => {
    const userId = 'user-2';
    const profile = new Profile(userId, [], []);

    (profileRepository.find as jest.Mock).mockResolvedValue(profile);

    const result = await useCase.execute({ userId });

    // profile without ratings/allergies should return empty arrays
    expect(result.food).toEqual([]);
    expect(result.allergies).toEqual([]);
  });
});
