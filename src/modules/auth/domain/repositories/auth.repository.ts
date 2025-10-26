import { User } from '../entities/user';
import { UserId } from '../value-objects/user-id';

export interface AuthRepository {
  register(user: User): Promise<void>;
  authorizer(userId: UserId): Promise<boolean>;
}
