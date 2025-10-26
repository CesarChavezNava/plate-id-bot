import { FoodAllergyAdderUseCase } from '@modules/profile/application/food-allergy-adder/food-allergy-adder.usecase';
import { UseGuards } from '@nestjs/common';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';
import { Context } from 'telegraf';
import { FoodAllergyAdderInput } from '@modules/profile/application/food-allergy-adder/food-allergy-adder.input';

@Update()
export class AllergyUpdate {
  constructor(
    private readonly foodAllergyAdderUseCase: FoodAllergyAdderUseCase,
  ) {}

  @UseGuards(AccessVerifierGuard)
  @Command('allergy')
  async handleHelp(@Ctx() ctx: Context) {
    try {
      const fullText = ctx.message['text'];
      const parts = fullText.split(' ');
      const foodName = parts.slice(1).join(' ').trim();

      if (!foodName) {
        return ctx.reply('Please specify a food. Example: /allergy Nuez');
      }

      const userId = ctx.from.id.toString();
      await this.foodAllergyAdderUseCase.execute(
        new FoodAllergyAdderInput(userId, foodName),
      );

      await ctx.reply(`👎 Got it! You've added allergy: ${foodName}`);
    } catch (err) {
      console.error('Internal error while adding allergy:', err);
      await ctx.reply('⚠️ Internal error while adding allergy.');
    }
  }
}
