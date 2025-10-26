import { Ctx, Help, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
export class HelpUpdate {
  @Help()
  async handleHelp(@Ctx() ctx: Context) {
    await ctx.reply(`
/help: Shows this help list. 
/register: Request access to start using the bot. 
/like [food name]: Tell me a dish that you love. 
/list likes: View my favorite dishes. 
/dislike [food name]: Tell me a dish that you do NOT like. 
/list dislikes: View the dishes that I don't like. 
/allergy [food name]: Add a food you are allergic to. 
/list allergies: View my list of allergen foods.
    `);
  }
}
