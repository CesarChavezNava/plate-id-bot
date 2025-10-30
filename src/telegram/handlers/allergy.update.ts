import { AllergyAdderUseCase } from '@modules/profile/application/allergy-adder/allergy-adder.usecase';
import { UseGuards } from '@nestjs/common';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';
import { AllergyAdderInput } from '@modules/profile/application/allergy-adder/allergy-adder.input';
import { RequestUtils } from '../utils/request.utils';
import { TelegrafI18nContext } from 'nestjs-telegraf-i18n';

@Update()
export class AllergyUpdate {
  constructor(private readonly foodAllergyAdderUseCase: AllergyAdderUseCase) {}

  @UseGuards(AccessVerifierGuard)
  @Command('allergy')
  async handleHelp(@Ctx() ctx: TelegrafI18nContext) {
    try {
      const fullText = ctx.message['text'];
      const parameters = RequestUtils.getParameters(fullText, 1);
      const foodName = parameters[0];

      const userId = ctx.from.id.toString();
      await this.foodAllergyAdderUseCase.execute(
        new AllergyAdderInput(userId, foodName),
      );

      await ctx.reply(
        ctx.t('telegram.ALLERGY.ADDED').replace('{{foodName}}', foodName),
      );
    } catch (err) {
      console.error('Internal error while adding allergy:', err);
      await ctx.reply(ctx.t('telegram.ALLERGY.ERROR'));
    }
  }
}
