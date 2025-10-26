import { ProfileRepository } from '@modules/profile/domain/repositories/profile.repository';
import { Inject, Injectable } from '@nestjs/common';
import { ProfileFinderInput } from './profile-finder.input';
import { ProfileNotFoundError } from '@modules/profile/domain/errors/profile-not-found.error';
import { ProfileFinderOutput } from './profile.finder.output';

@Injectable()
export class ProfileFinderUseCase {
  constructor(
    @Inject('ProfileRepository')
    private readonly profileRepository: ProfileRepository,
  ) {}

  async execute(input: ProfileFinderInput): Promise<ProfileFinderOutput> {
    const profile = await this.profileRepository.find(input.userId);

    if (!profile) {
      throw new ProfileNotFoundError(input.userId);
    }

    const likes = [];
    const dislikes = [];

    for (const rating of profile.food) {
      if (rating.rating === 'like') {
        likes.push(rating);
      } else {
        dislikes.push(rating);
      }
    }

    return new ProfileFinderOutput(
      profile.userId,
      likes,
      dislikes,
      profile.allergies,
    );
  }
}
