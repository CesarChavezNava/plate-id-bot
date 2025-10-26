import { DishLikerInput } from '@modules/profile/application/dish-liker/dish-liker.input';
import { DishLikerUseCase } from '@modules/profile/application/dish-liker/dish-liker.usecase';
import { UseGuards } from '@nestjs/common';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';

@Update()
export class LikeUpdate {
  constructor(private readonly dishLikerUseCase: DishLikerUseCase) {}

  @UseGuards(AccessVerifierGuard)
  @Command('like')
  async handleHelp(@Ctx() ctx: Context) {
    try {
      const fullText = ctx.message['text'];
      const parts = fullText.split(' ');
      const foodName = parts.slice(1).join(' ').trim();

      if (!foodName) {
        return ctx.reply(
          'Please specify a dish. Example: /like Tacos al pastor',
        );
      }

      const userId = ctx.from.id.toString();
      await this.dishLikerUseCase.execute(new DishLikerInput(userId, foodName));

      await ctx.reply(`👍 Got it! You've liked: ${foodName}`);
    } catch (err) {
      console.error('Internal error while liking:', err);
      await ctx.reply('⚠️ Internal error while liking.');
    }
  }
}
