import { UseGuards } from '@nestjs/common';
import { Ctx, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';
import { PhotoRecognizerAgent } from '../../agents/photo-recognizer.agent';

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

    try {
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const fileUrl = fileLink.href;

      const agentResponse = await this.agent.runAgent(fileUrl, userId);
      const jsonResponse = JSON.parse(agentResponse);

      if (
        jsonResponse.dish_name === 'UNRECOGNIZED' ||
        jsonResponse.dish_name === 'GENERIC_FOOD'
      ) {
        await ctx.reply('⚠️ The food could not be recognized in the image.');
        return;
      }
      if (jsonResponse.dish_name === 'MANY_DISHES') {
        await ctx.reply(
          '⚠️ The image contains multiple dishes. Please upload an image with a single dish.',
        );
        return;
      }

      const contentCompatibility = '⭐'.repeat(
        Math.max(1, Math.min(5, Math.round(jsonResponse.compatibility_rating))),
      );

      await ctx.reply(`🍽️ Personalized recommendation for ${jsonResponse.dish_name}: \n
        ${contentCompatibility}`);
    } catch (err) {
      console.error('Error while processing photo for agent:', err);
      await ctx.reply('⚠️ Error while processing photo for Agent.');
    }
  }
}
