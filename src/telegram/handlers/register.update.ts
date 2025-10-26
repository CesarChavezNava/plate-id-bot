import { UserRgistererInput } from '@modules/auth/application/user-registerer/user-registerer.input';
import { UserRgistererUseCase } from '@modules/auth/application/user-registerer/user-registerer.usecase';
import { Update, Ctx, Command } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
export class RegisterUpdate {
  constructor(private readonly signUpUseCase: UserRgistererUseCase) {}

  @Command('register')
  async handleRegister(@Ctx() ctx: Context) {
    try {
      const userId = ctx.from.id.toString();
      await this.signUpUseCase.execute(new UserRgistererInput(userId));

      await ctx.reply(`
Registration request submitted! 📝
We have received your request to use PlateID Bot.
Your access is now pending administrator approval. We will notify you shortly once your account has been reviewed and activated.
Thank you for your patience! 😊`);
    } catch (err) {
      console.error('Internal error while registering:', err);
      await ctx.reply('⚠️ Internal error while registering.');
    }
  }
}
