import { UseGuards } from '@nestjs/common';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { DishDislikerUseCase } from '@modules/profile/application/dish-disliker/dish-disliker.usecase';
import { Context } from 'telegraf';
import { DishDislikerInput } from '@modules/profile/application/dish-disliker/dish-disliker.input';

@Update()
export class DislikeUpdate {
  constructor(private readonly dishDislikerUseCase: DishDislikerUseCase) {}

  @UseGuards(AccessVerifierGuard)
  @Command('dislike')
  async handleHelp(@Ctx() ctx: Context) {
    try {
      const fullText = ctx.message['text'];
      const parts = fullText.split(' ');
      const foodName = parts.slice(1).join(' ').trim();

      if (!foodName) {
        return ctx.reply(
          'Please specify a food. Example: /dislike Tacos al pastor',
        );
      }

      const userId = ctx.from.id.toString();
      await this.dishDislikerUseCase.execute(
        new DishDislikerInput(userId, foodName),
      );

      await ctx.reply(`👎 Got it! You've disliked: ${foodName}`);
    } catch (err) {
      console.error('Internal error while disliking:', err);
      await ctx.reply('⚠️ Internal error while disliking.');
    }
  }
}
