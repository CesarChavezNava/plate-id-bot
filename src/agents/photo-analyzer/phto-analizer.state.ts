import * as z from 'zod';
import { BaseMessage } from '@langchain/core/messages';

const ImageType = z.enum(['menu', 'platillo', 'otro']);
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
  imageType: ImageType.optional().describe(
    "Clasificación de la imagen: 'menu', 'platillo' o 'otro'.",
  ),
  imageRawData: z
    .string()
    .optional()
    .describe(
      'Texto de OCR si es un menú, o descripción de ingredientes si es un platillo.',
    ),
  recommendations: z
    .array(z.string())
    .optional()
    .describe('Lista de 5 recomendaciones si es un menú.'),
  affinityScore: z
    .number()
    .optional()
    .describe('Puntuación de afinidad si es un platillo (ej. 0.0 a 1.0).'),
  finalResponse: z
    .string()
    .optional()
    .describe('El mensaje final formateado para mostrar al usuario.'),
});

export type PhotoAnalyzerState = z.infer<typeof PhotoAnalyzerStateSchema>;
