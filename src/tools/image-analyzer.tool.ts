import { Runnable } from '@langchain/core/runnables';
import { Tool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { HumanMessage } from 'langchain';

const IMAGE_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['menu', 'food', 'other'],
      description: 'Clasificación principal del contenido de la imagen.',
    },
    description: {
      type: 'string',
      description:
        'Descripción detallada del contenido, colores y elementos clave.',
    },
    needs_ocr: {
      type: 'boolean',
      description:
        'True si la imagen contiene texto denso y relevante (ej. un menú, un recibo) que debe ser extraído.',
    },
  },
  required: ['type', 'description', 'needs_ocr'],
};

@Injectable()
export class ImageAnalyzerTool extends Tool {
  public name = 'analyze_image_content';
  public description = `Analiza una imagen basándose en la referencia proporcionada (imageReference). 
    Devuelve la descripción del contenido y si se trata de un menú o de comida específica.
    El input debe ser un string con el ID o referencia de la imagen.`;

  private readonly model: Runnable<any, any>;

  constructor() {
    super();

    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      openAIApiKey: process.env.OPENAI_API_KEY,
    }).withConfig({
      response_format: { type: 'json_object' },
    });
  }

  public async _call(imageReference: string): Promise<string> {
    const humanMessage = new HumanMessage({
      content: [
        {
          type: 'text',
          text: `Analiza esta imagen. Genera la respuesta JSON estricta basada en el esquema proporcionado. La referencia de la imagen es: ${imageReference}`,
        },
        {
          type: 'image_url',
          image_url: {
            url: imageReference,
            detail: 'low',
          },
        },
      ],
    });

    const systemMessage = {
      content: `Eres un asistente experto en clasificación de imágenes para un bot de comida. Tu tarea es analizar el contenido visual y responder ÚNICAMENTE con un objeto JSON estricto que cumpla con el siguiente esquema: ${JSON.stringify(IMAGE_ANALYSIS_SCHEMA)}`,
      role: 'system' as const,
    };

    try {
      const response = await this.model.invoke([systemMessage, humanMessage]);
      return response.content.toString();
    } catch (error) {
      console.error('Fallo en la llamada al modelo de visión:', error);
      return JSON.stringify({
        type: 'error',
        description: `Error al procesar la imagen: ${error.message}`,
        needs_ocr: false,
      });
    }
  }
}
