import { PhotoAnalizerAgent } from '@agents/photo-analyzer/photo-analyzer.agent';
import { Ctx, On, Update } from 'nestjs-telegraf';
import { AccessVerifierGuard } from '../guards/access-verifier.guard';
import { UseGuards } from '@nestjs/common';
import { Context } from 'telegraf';

@Update()
export class TextUpdate {
  constructor(private readonly agent: PhotoAnalizerAgent) {}

  @UseGuards(AccessVerifierGuard)
  @On('text')
  async handleText(@Ctx() ctx: Context) {
    const userId = ctx.from.id.toString();

    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

    try {
      console.log('Ejecutando agente...', userId);
      // 1. Ejecutar el agente. agentResponse ahora es un simple string.
      const agentResponse: string = await this.agent.run(userId, ''); // ⬅️ Respuesta simple (string)

      // 2. Responder directamente
      await ctx.reply(agentResponse); // ⬅️ No se requiere extracción ni validación de tipos
    } catch (error) {
      console.error('Error durante la ejecución del agente:', error);
      await ctx.reply('⚠️ Error interno al contactar al Agente de IA.');
    }
  }
}
