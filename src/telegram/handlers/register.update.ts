import { UserRgistererInput } from '@modules/auth/application/user-registerer/user-registerer.input';
import { UserRgistererUseCase } from '@modules/auth/application/user-registerer/user-registerer.usecase';
import { Update, Ctx, Command } from 'nestjs-telegraf';
import { TelegrafI18nContext } from 'nestjs-telegraf-i18n';

@Update()
export class RegisterUpdate {
  constructor(private readonly signUpUseCase: UserRgistererUseCase) {}

  @Command('register')
  async handleRegister(@Ctx() ctx: TelegrafI18nContext) {
    try {
      const userId = ctx.from.id.toString();
      await this.signUpUseCase.execute(new UserRgistererInput(userId));

      await ctx.reply(ctx.t('telegram.REGISTER.RESPONSE'));
    } catch (err) {
      console.error('Internal error while registering:', err);
      await ctx.reply(ctx.t('telegram.REGISTER.ERROR'));
    }
  }
}
