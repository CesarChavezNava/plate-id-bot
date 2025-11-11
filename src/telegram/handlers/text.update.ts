import { Ctx, On, Update } from 'nestjs-telegraf';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';
import { UseGuards } from '@nestjs/common';
import { Context } from 'telegraf';
import { MetaState } from '@agents/meta/meta.state';
import { MetaAgent } from '@agents/meta/meta.agent';
import { HumanMessage } from '@langchain/core/messages';

@Update()
export class TextUpdate {
  constructor(private readonly metaAgent: MetaAgent) {}

  @UseGuards(AccessVerifierGuard)
  @On('text')
  async handleText(@Ctx() ctx: Context) {
    const userId = ctx.from.id.toString();
    const userQuery = ctx.message['text'];

    ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

    try {
      const lastFoodAnalyzed = await this.loadLastFoodAnalyzed(userId);

      const initialState: MetaState = {
        userId: userId,
        lastFoodAnalyzed: lastFoodAnalyzed,
        messages: [new HumanMessage(userQuery)],
      };

      const agentResponse = await this.metaAgent.run(initialState);

      await ctx.reply(agentResponse, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Error while processing text for agent:', err);
      await ctx.reply('¡Ay, nanita! Hubo un error procesando tu mensaje.');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async loadLastFoodAnalyzed(_: string): Promise<string | null> {
    // Aquí harías una llamada a tu checkpointer o base de datos:
    // const state = await this.metaAgent.getCheckpointer().load(userId);
    // return state?.lastFoodAnalyzed || null;

    // Retorno hardcodeado para ejemplo:
    return null;
  }
}
