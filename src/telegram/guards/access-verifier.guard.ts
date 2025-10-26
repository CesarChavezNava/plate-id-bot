import { UserAuthorizerInput } from '@modules/auth/application/user-authorizer/user-authorizer.input';
import { UserAuthorizerUseCase } from '@modules/auth/application/user-authorizer/user-authorizer.usecase';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Injectable()
export class AccessVerifierGuard implements CanActivate {
  constructor(private readonly userAuthorizerUseCase: UserAuthorizerUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let isAuthorized = true;
    try {
      const ctx = TelegrafExecutionContext.create(context);
      const tgContext: Context = ctx.getContext();

      const userId = tgContext.from?.id.toString();
      isAuthorized = await this.userAuthorizerUseCase.execute(
        new UserAuthorizerInput(userId),
      );
    } catch (error) {
      console.error('Access verification failed: ', error);
      isAuthorized = false;
    }
    return isAuthorized;
  }
}
