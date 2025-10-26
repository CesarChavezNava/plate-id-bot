import { Profile } from '@modules/profile/domain/entities/profile';

export interface ProfileRepository {
  find(userId: string): Promise<Profile>;
}
