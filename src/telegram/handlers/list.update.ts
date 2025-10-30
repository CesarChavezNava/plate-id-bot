import { UseGuards } from '@nestjs/common';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';
import { RatedFoodSearcherUseCase } from '@modules/profile/application/rated-food-searcher/rated-food-searcher.usecase';
import { RatedFoodSearcherInput } from '@modules/profile/application/rated-food-searcher/rated-food-searcher.input';
import { RequestUtils } from '../utils/request.utils';
import { TelegrafI18nContext } from 'nestjs-telegraf-i18n';

@Update()
export class ListUpdate {
  constructor(private readonly ratedDishesSearcher: RatedFoodSearcherUseCase) {}

  @UseGuards(AccessVerifierGuard)
  @Command('list')
  async handleHelp(@Ctx() ctx: TelegrafI18nContext) {
    try {
      const fullText = ctx.message['text'];
      const parameters = RequestUtils.getParameters(fullText, 1);
      const nameList = parameters[0].toLowerCase();

      const userId = ctx.from.id.toString();

      if (nameList === 'allergies') {
        const allergies = await this.ratedDishesSearcher.execute(
          new RatedFoodSearcherInput(userId, true),
        );
        const allergyList = allergies
          .map((allergy) => `🍽️ ${allergy.food.name}`)
          .join('\n');
        await ctx.reply(`${ctx.t('telegram.LIST.ALLERGIES')}\n${allergyList}`);
        return;
      }

      if (nameList === 'food') {
        const ratingFood = await this.ratedDishesSearcher.execute(
          new RatedFoodSearcherInput(userId),
        );
        const foodList = ratingFood
          .map(
            (ratingFood) => `🍽️ ${ratingFood.food.name} 📈 ${ratingFood.score}`,
          )
          .join('\n');
        await ctx.reply(`${ctx.t('telegram.LIST.FOOD')}:\n${foodList}`);
        return;
      }

      await ctx.reply(ctx.t('telegram.LIST.FORMAT_ERROR'));
    } catch (err) {
      console.error('Internal error while listing:', err);
      await ctx.reply(ctx.t('telegram.LIST.ERROR'));
    }
  }
}
