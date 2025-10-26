import { Inject, Injectable } from '@nestjs/common';
import { AuthRepository } from '@modules/auth/domain/repositories/auth.repository';
import { User } from '@modules/auth/domain/entities/user';
import { UserRgistererInput } from './user-registerer.input';

@Injectable()
export class UserRgistererUseCase {
  constructor(
    @Inject('AuthRepository') private readonly authRepository: AuthRepository,
  ) {}

  async execute(input: UserRgistererInput): Promise<void> {
    await this.authRepository.register(new User(input.userId, 'ON_HOLD'));
  }
}
