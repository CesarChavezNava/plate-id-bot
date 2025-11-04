import { UseGuards } from '@nestjs/common';
import { Ctx, On, Update } from 'nestjs-telegraf';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';
import { TelegrafI18nContext } from 'nestjs-telegraf-i18n';
import { PhotoAnalizerAgent } from '@agents/photo-analyzer/photo-analyzer.agent';

@Update()
export class PhotoUpdate {
  constructor(private readonly photoAnalyzerAgent: PhotoAnalizerAgent) {}

  @UseGuards(AccessVerifierGuard)
  @On('photo')
  async handlePhotoToAgent(@Ctx() ctx: TelegrafI18nContext) {
    const userId = ctx.from.id.toString();

    const photoSizes = ctx.message['photo'];
    const bestPhoto = photoSizes[photoSizes.length - 1];
    const fileId = bestPhoto.file_id;

    const actionRefresher = setInterval(() => {
      ctx.telegram.sendChatAction(ctx.chat.id, 'typing').catch((e) => {
        console.error('Error refreshing chat action:', e.message);
      });
    }, 4500);

    try {
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const fileUrl = fileLink.href;

      const agentResponse = await this.photoAnalyzerAgent.run(userId, fileUrl);
      clearInterval(actionRefresher);
      await ctx.reply(agentResponse, { parse_mode: 'Markdown' });
    } catch (err) {
      clearInterval(actionRefresher);

      console.error('Error while processing photo for agent:', err);
      await ctx.reply(ctx.t('telegram.PHOTO.ERROR'));
    }
  }
}
