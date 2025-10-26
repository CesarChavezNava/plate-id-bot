import { UseGuards } from '@nestjs/common';
import { Ctx, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';
import { PhotoRecognizerAgent } from '../../agents/photo-recognizer.agent';
import { MessageBuilder } from '../utils/message.utils';

@Update()
export class PhotoUpdate {
  constructor(private readonly agent: PhotoRecognizerAgent) {}

  @UseGuards(AccessVerifierGuard)
  @On('photo')
  async handlePhotoToAgent(@Ctx() ctx: Context) {
    const userId = ctx.from.id.toString();

    const photoSizes = ctx.message['photo'];
    const bestPhoto = photoSizes[photoSizes.length - 1];
    const fileId = bestPhoto.file_id;

    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
    const actionRefresher = setInterval(() => {
      ctx.telegram.sendChatAction(ctx.chat.id, 'typing').catch((e) => {
        console.error('Error refreshing chat action:', e.message);
      });
    }, 4500);

    try {
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const fileUrl = fileLink.href;

      const agentResponse = await this.agent.runAgent(fileUrl, userId);
      clearInterval(actionRefresher);

      const replyMessage =
        MessageBuilder.buildCompatibilityReplyMessage(agentResponse);

      await ctx.reply(replyMessage, { parse_mode: 'Markdown' });
    } catch (err) {
      clearInterval(actionRefresher);

      console.error('Error while processing photo for agent:', err);
      await ctx.reply('⚠️ Error while processing photo for Agent.');
    }
  }
}
