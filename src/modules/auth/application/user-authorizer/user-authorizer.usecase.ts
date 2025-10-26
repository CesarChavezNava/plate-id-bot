import { AuthRepository } from '@modules/auth/domain/repositories/auth.repository';
import { UserId } from '@modules/auth/domain/value-objects/user-id';
import { Inject, Injectable } from '@nestjs/common';
import { UserAuthorizerInput } from './user-authorizer.input';

@Injectable()
export class UserAuthorizerUseCase {
  constructor(
    @Inject('AuthRepository') private readonly authRepository: AuthRepository,
  ) {}

  async execute(input: UserAuthorizerInput): Promise<boolean> {
    const isAuthenticated = await this.authRepository.authorizer(
      new UserId(input.userId),
    );
    return isAuthenticated;
  }
}
