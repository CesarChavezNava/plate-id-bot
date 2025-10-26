import { Update, Ctx, Start } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
export class StartUpdate {
  @Start()
  async handleStart(@Ctx() ctx: Context) {
    await ctx.reply(`
Welcome to PlateID Bot! 🍔🥗🤖
I'm your AI assistant that helps you discover whether you'll love (or hate) a new food based on your tastes, dislikes, and your allergies!
👉 Get started right away with the command: /register
Do you have questions about how it works? Use /help for all the details. Happy eating!`);
  }
}
