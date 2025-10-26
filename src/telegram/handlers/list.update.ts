import { UseGuards } from '@nestjs/common';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';
import { RatedFoodSearcherUseCase } from '@modules/profile/application/rated-food-searcher/rated-food-searcher.usecase';
import { RatedFoodSearcherInput } from '@modules/profile/application/rated-food-searcher/rated-food-searcher.input';
import { FoodAllergiesSearcherUseCase } from '@modules/profile/application/food-allergies-searcher/food-allergies-searcher.usecase';
import { FoodAllergiesSearcherInput } from '@modules/profile/application/food-allergies-searcher/food-allergies-searcher.input';

@Update()
export class ListUpdate {
  constructor(
    private readonly ratedDishesSearcher: RatedFoodSearcherUseCase,
    private readonly foodAllergiesSearcher: FoodAllergiesSearcherUseCase,
  ) {}

  @UseGuards(AccessVerifierGuard)
  @Command('list')
  async handleHelp(@Ctx() ctx: Context) {
    try {
      const fullText = ctx.message['text'];
      const parts = fullText.split(' ');
      const nameList = parts.slice(1).join(' ').trim().toLowerCase();

      if (!nameList) {
        return ctx.reply('Please specify a filter. Example: /list likes');
      }

      if (
        nameList !== 'likes' &&
        nameList !== 'dislikes' &&
        nameList !== 'allergies'
      ) {
        return ctx.reply(
          'Please specify a correct filter. Example: /list likes',
        );
      }

      const userId = ctx.from.id.toString();

      if (nameList === 'allergies') {
        const allergies = await this.foodAllergiesSearcher.execute(
          new FoodAllergiesSearcherInput(userId),
        );
        const allergyList = allergies
          .map((allergy) => `- ${allergy.foodName} 🍽️`)
          .join('\n');
        await ctx.reply(`These are your allergies:\n${allergyList}`);
      } else {
        const ratingDishes = await this.ratedDishesSearcher.execute(
          new RatedFoodSearcherInput(userId, nameList),
        );
        const dishList = ratingDishes
          .map((dish) => `- ${dish.foodName} 🍽️`)
          .join('\n');
        await ctx.reply(`These are your dishes:\n${dishList}`);
      }
    } catch (err) {
      console.error('Internal error while listing:', err);
      await ctx.reply('⚠️ Internal error while listing.');
    }
  }
}
