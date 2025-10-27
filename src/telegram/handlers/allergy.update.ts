import { AllergyAdderUseCase } from '@modules/profile/application/allergy-adder/allergy-adder.usecase';
import { UseGuards } from '@nestjs/common';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';
import { Context } from 'telegraf';
import { AllergyAdderInput } from '@modules/profile/application/allergy-adder/allergy-adder.input';
import { RequestUtils } from '../utils/request.utils';

@Update()
export class AllergyUpdate {
  constructor(private readonly foodAllergyAdderUseCase: AllergyAdderUseCase) {}

  @UseGuards(AccessVerifierGuard)
  @Command('allergy')
  async handleHelp(@Ctx() ctx: Context) {
    try {
      const fullText = ctx.message['text'];
      const parameters = RequestUtils.getParameters(fullText, 1);
      const foodName = parameters[0];

      const userId = ctx.from.id.toString();
      await this.foodAllergyAdderUseCase.execute(
        new AllergyAdderInput(userId, foodName),
      );

      await ctx.reply(`👎 Got it! You've added allergy: ${foodName}`);
    } catch (err) {
      console.error('Internal error while adding allergy:', err);
      await ctx.reply('⚠️ Internal error while adding allergy.');
    }
  }
}
