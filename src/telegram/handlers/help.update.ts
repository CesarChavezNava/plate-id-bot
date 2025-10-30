import { Ctx, Help, Update } from 'nestjs-telegraf';
import { TelegrafI18nContext } from 'nestjs-telegraf-i18n';

@Update()
export class HelpUpdate {
  @Help()
  async handleHelp(@Ctx() ctx: TelegrafI18nContext) {
    await ctx.reply(ctx.t('telegram.HELP.COMMANDS'));
  }
}
