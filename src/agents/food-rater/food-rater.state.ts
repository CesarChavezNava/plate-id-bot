import * as z from 'zod';
import { BaseMessageSchema } from '@agents/shared/base-messages';

export const FoodRaterStateSchema = z.object({
  userId: z.string().describe('ID de la sesión del usuario.'),
  lastFoodAnalyzed: z.string().nullable(),
  messages: z
    .array(BaseMessageSchema)
    .describe('Historial de la conversación y observaciones de herramientas.'),
});

export type FoodRaterState = z.infer<typeof FoodRaterStateSchema>;

export enum AgentSteps {
  CallTool = 'call_tool',
  Respond = 'respond',
}
