import z from 'zod/v3';
import { UseGuards } from '@nestjs/common';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';
import { RequestUtils } from '../utils/request.utils';
import { FoodRaterUseCase } from '@modules/profile/application/food-rater/food-rater.usecase';
import { FoodRaterInput } from '@modules/profile/application/food-rater/food-rater.input';
import { TelegrafI18nContext } from 'nestjs-telegraf-i18n';

const FoodSchema = z.object({
  name: z.string(),
  score: z.coerce.number(),
});

@Update()
export class FoodUpdate {
  constructor(private readonly foodRaterUseCase: FoodRaterUseCase) {}

  @UseGuards(AccessVerifierGuard)
  @Command('food')
  async handleHelp(@Ctx() ctx: TelegrafI18nContext) {
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

      await ctx.reply(
        ctx.t('telegram.FOOD.ADDED').replace('{{foodName}}', food.name),
      );
    } catch (err) {
      console.error('Internal error while adding food:', err);

      if (err instanceof z.ZodError) {
        await ctx.reply(ctx.t('telegram.FOOD.FORMAT_ERROR'));
        return;
      }

      await ctx.reply(ctx.t('telegram.FOOD.ERROR'));
    }
  }
}
