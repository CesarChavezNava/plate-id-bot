import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { SettingSetterUseCase } from '@modules/setting/application/setting-setter/setting-setter.usecase';
import { SettingSetterInput } from '@modules/setting/application/setting-setter/setting-setter.input';

@Update()
export class LanguageUpdate {
  constructor(private readonly settingSetterUseCase: SettingSetterUseCase) {}

  @Command('language')
  async handleHelp(@Ctx() ctx: Context) {
    const languageKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🇲🇽 Español', 'set_lang_es')],
      [Markup.button.callback('🇺🇸 English', 'set_lang_en')],
    ]);

    await ctx.reply('🌐 Please select your language:', languageKeyboard);
  }

  @Action(/set_lang_(es|en)/)
  async onLanguageSelected(@Ctx() ctx: Context) {
    const userId = ctx.from.id.toString();
    const callbackData = ctx.callbackQuery['data'];
    const langCode = callbackData.split('_')[2];
    let replyText = '';

    // Lógica para actualizar el idioma
    let input;
    if (langCode === 'es') {
      input = new SettingSetterInput(userId, 'language', 'spanish');
      replyText = '✅ ¡Idioma cambiado a **Español**!';
    } else if (langCode === 'en') {
      input = new SettingSetterInput(userId, 'language', 'english');
      replyText = '✅ Language set to **English**!';
    } else {
      await ctx.editMessageText('⚠️ Language option not recognized.', {
        parse_mode: 'Markdown',
      });
      return;
    }

    try {
      await this.settingSetterUseCase.execute(input);
      await ctx.editMessageText(replyText, { parse_mode: 'Markdown' });
    } catch {
      await ctx.reply(replyText, { parse_mode: 'Markdown' });
    }

    await ctx.answerCbQuery();
  }
}
