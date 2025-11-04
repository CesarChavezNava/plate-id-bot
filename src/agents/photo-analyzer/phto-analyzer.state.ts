import * as z from 'zod';
import { BaseMessage } from '@langchain/core/messages';

const BaseMessageSchema = z.instanceof(BaseMessage);

export const PhotoAnalyzerStateSchema = z.object({
  userId: z.string().describe('ID de la sesión del usuario.'),
  messages: z
    .array(BaseMessageSchema)
    .describe('Historial de la conversación y observaciones de herramientas.'),
  imageReference: z
    .string()
    .describe('URL o ID de la imagen para su procesamiento.'),
  profileContent: z
    .string()
    .describe(
      'Preferencias de comida del usuario (ej. JSON con alergias y gustos).',
    )
    .optional(),
  finalResponse: z
    .string()
    .optional()
    .describe('El mensaje final formateado para mostrar al usuario.'),
});

export type PhotoAnalyzerState = z.infer<typeof PhotoAnalyzerStateSchema>;
