import { ProfileRepository } from '@modules/profile/domain/repositories/profile.repository';
import { Inject, Injectable } from '@nestjs/common';
import { ProfileFinderInput } from './profile-finder.input';
import { ProfileNotFoundError } from '@modules/profile/domain/errors/profile-not-found.error';
import { Profile } from '@modules/profile/domain/entities/profile';

@Injectable()
export class ProfileFinderUseCase {
  constructor(
    @Inject('ProfileRepository')
    private readonly profileRepository: ProfileRepository,
  ) {}

  async execute(input: ProfileFinderInput): Promise<Profile> {
    const profile = await this.profileRepository.find(input.userId);
    if (!profile) {
      throw new ProfileNotFoundError(input.userId);
    }

    return profile;
  }
}
