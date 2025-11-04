import { Tool } from '@langchain/core/tools';
import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';

@Injectable()
export class OCRMenuExtractorTool extends Tool {
  public name = 'extract_text_ocr';
  public description = `Extrae todo el texto visible de una imagen (como un menú, recibo o cualquier lista de platos).
    El input DEBE ser la URL o referencia pública de la imagen.`;

  private readonly model: Runnable;

  constructor() {
    super();

    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.1,
    }) as Runnable;
  }

  public async _call(imageReference: string): Promise<string> {
    const humanMessage = new HumanMessage({
      content: [
        {
          type: 'text',
          text: 'Por favor, extrae TODO el texto visible y relevante de esta imagen. Formatea el texto de manera legible, conservando cualquier estructura de lista o menú que detectes.',
        },
        {
          type: 'image_url',
          image_url: {
            url: imageReference,
            detail: 'auto',
          },
        },
      ],
    });

    const systemMessage = {
      content:
        'Eres un servicio de Reconocimiento Óptico de Caracteres (OCR). Solo devuelve el texto extraído de la imagen. No añadas comentarios ni explicaciones.',
      role: 'system' as const,
    };

    try {
      const response = await this.model.invoke([systemMessage, humanMessage]);
      return response.content.toString();
    } catch (error) {
      console.error('Fallo en la llamada al modelo OCR:', error);
      return `ERROR_OCR: Fallo al extraer texto de la imagen. Causa: ${error.message}.`;
    }
  }
}
