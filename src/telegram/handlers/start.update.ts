import { Update, Ctx, Start } from 'nestjs-telegraf';
import { TelegrafI18nContext } from 'nestjs-telegraf-i18n';

@Update()
export class StartUpdate {
  @Start()
  async handleStart(@Ctx() ctx: TelegrafI18nContext) {
    await ctx.reply(ctx.t('telegram.START.WELCOME'));
  }
}
