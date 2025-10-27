import z from 'zod/v3';
import { UseGuards } from '@nestjs/common';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';
import { RequestUtils } from '../utils/request.utils';
import { FoodRaterUseCase } from '@modules/profile/application/food-rater/food-rater.usecase';
import { FoodRaterInput } from '@modules/profile/application/food-rater/food-rater.input';

const FoodSchema = z.object({
  name: z.string(),
  score: z.coerce.number(),
});

@Update()
export class FoodUpdate {
  constructor(private readonly foodRaterUseCase: FoodRaterUseCase) {}

  @UseGuards(AccessVerifierGuard)
  @Command('food')
  async handleHelp(@Ctx() ctx: Context) {
    try {
      const fullText = ctx.message['text'];
      const parameters = RequestUtils.getParameters(fullText, 2);

      const food = FoodSchema.parse({
        name: parameters[0],
        score: parameters[1],
      });

      const userId = ctx.from.id.toString();
      await this.foodRaterUseCase.execute(
        new FoodRaterInput(userId, food.name, food.score),
      );

      await ctx.reply(`✔️🍽️ Got it! You've added the food: ${food.name}`);
    } catch (err) {
      console.error('Internal error while adding food:', err);

      if (err instanceof z.ZodError) {
        await ctx.reply(
          '⚠️ Please specify a food with score separated by "|". Example: /food Nuez | 5',
        );
        return;
      }

      await ctx.reply('❌ Internal error while adding food.');
    }
  }
}
