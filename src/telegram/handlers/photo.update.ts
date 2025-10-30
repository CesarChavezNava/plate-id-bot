import { UseGuards } from '@nestjs/common';
import { Ctx, On, Update } from 'nestjs-telegraf';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';
import { FoodMenuAnalyzerAgent } from '@agents/food-menu-analyzer/food-menu-analyzer.agent';
import { DishRecognizerAgent } from '@agents/dish-recognizer/dish-recognizer.agent';
import { TelegrafI18nContext } from 'nestjs-telegraf-i18n';

@Update()
export class PhotoUpdate {
  constructor(
    private readonly foodMenuAnalyzerAgent: FoodMenuAnalyzerAgent,
    private readonly dishRecognizerAgent: DishRecognizerAgent,
  ) {}

  @UseGuards(AccessVerifierGuard)
  @On('photo')
  async handlePhotoToAgent(@Ctx() ctx: TelegrafI18nContext) {
    const userId = ctx.from.id.toString();
    const caption: string | undefined = ctx.message['caption'];

    if (!caption) {
      await ctx.reply(ctx.t('telegram.PHOTO.NO_CAPTION'));
      return;
    }

    const photoSizes = ctx.message['photo'];
    const bestPhoto = photoSizes[photoSizes.length - 1];
    const fileId = bestPhoto.file_id;
    const lang = ctx.i18n().lang;

    const actionRefresher = setInterval(() => {
      ctx.telegram.sendChatAction(ctx.chat.id, 'typing').catch((e) => {
        console.error('Error refreshing chat action:', e.message);
      });
    }, 4500);

    try {
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const fileUrl = fileLink.href;

      switch (caption.trim().toLowerCase()) {
        case 'menu':
          await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

          const agentResponse1 = await this.foodMenuAnalyzerAgent.runAgent(
            fileUrl,
            userId,
            lang,
          );

          clearInterval(actionRefresher);
          await ctx.reply(agentResponse1, { parse_mode: 'Markdown' });
          break;
        case 'food':
          await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

          const agentResponse = await this.dishRecognizerAgent.runAgent(
            fileUrl,
            userId,
            lang,
          );

          clearInterval(actionRefresher);
          await ctx.reply(agentResponse, { parse_mode: 'Markdown' });

          break;
        default:
          clearInterval(actionRefresher);
          await ctx.reply(ctx.t('telegram.PHOTO.CAPTION_NOT_RECOGNIZED'));
          break;
      }
    } catch (err) {
      clearInterval(actionRefresher);

      console.error('Error while processing photo for agent:', err);
      await ctx.reply(ctx.t('telegram.PHOTO.ERROR'));
    }
  }
}
