import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import {
  PhotoAnalyzerState,
  PhotoAnalyzerStateSchema,
} from './phto-analizer.state';
import { END, MemorySaver, START, StateGraph } from '@langchain/langgraph';
import { AIMessage, BaseMessage, HumanMessage, ToolMessage } from 'langchain';
import { Runnable } from '@langchain/core/runnables';
import { FindProfileTool } from '@tools/find-profile.tool';
import { ImageAnalyzerTool } from '@tools/image-analyzer.tool';
import { OCRMenuExtractorTool } from '@tools/ocr-menu-extractor.tool';

type PhotoAnalyzerToolType =
  | FindProfileTool
  | ImageAnalyzerTool
  | OCRMenuExtractorTool;

@Injectable()
export class PhotoAnalizerAgent {
  private readonly model: Runnable<any, any>;
  private readonly compliledGraph: any;
  private toolsByName: Record<string, PhotoAnalyzerToolType>;

  constructor(
    private readonly findProfileTool: FindProfileTool,
    private readonly imageAnalyzerTool: ImageAnalyzerTool,
    private readonly ocrMenuExtractorTool: OCRMenuExtractorTool,
  ) {
    this.toolsByName = {
      [this.findProfileTool.name]: this.findProfileTool,
      [this.imageAnalyzerTool.name]: this.imageAnalyzerTool,
      [this.ocrMenuExtractorTool.name]: this.ocrMenuExtractorTool,
    };

    const tools = Object.values(this.toolsByName);
    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      openAIApiKey: process.env.OPENAI_API_KEY,
    }).bindTools(tools) as Runnable<any, any>;

    this.compliledGraph = this.buildGraph();
  }

  private buildGraph() {
    const workflow = new StateGraph(PhotoAnalyzerStateSchema);
    workflow
      .addNode('llmCall', this.llmCall.bind(this))
      .addNode('toolNode', this.toolNode.bind(this))
      .addEdge(START, 'llmCall')
      .addConditionalEdges('llmCall', this.shouldContinue.bind(this), {
        toolCall: 'toolNode',
        end: END,
      })
      .addConditionalEdges('toolNode', this.shouldOcrContinue.bind(this), {
        ocrCall: 'llmCall',
        continue: 'llmCall',
      });

    return workflow.compile({ checkpointer: new MemorySaver() });
  }

  private async llmCall(
    state: PhotoAnalyzerState,
  ): Promise<{ messages: BaseMessage[] }> {
    const messages = state.messages || [];
    const response = await this.model.invoke(state.messages);

    return {
      messages: [...messages, response],
    };
  }

  private async toolNode(state: PhotoAnalyzerState) {
    const messages = state.messages || [];
    const lastMessage = state.messages.at(-1);

    if (lastMessage == null || lastMessage.type !== 'ai') {
      return { messages: [] };
    }

    const aiMessage = lastMessage as AIMessage;

    if (!aiMessage.tool_calls || aiMessage.tool_calls.length === 0) {
      return { messages: [] };
    }

    const result: ToolMessage[] = [];
    let updatedProfileContent = state.profileContent;

    for (const toolCall of aiMessage.tool_calls) {
      const tool = this.toolsByName[toolCall.name];

      if (tool) {
        const inputString = toolCall.args.input;
        const observation = await tool._call(inputString);

        if (toolCall.name === this.findProfileTool.name) {
          updatedProfileContent = observation;
        }

        result.push(
          new ToolMessage({
            content: observation,
            tool_call_id: toolCall.id,
            name: toolCall.name,
          }),
        );
      } else {
        result.push(
          new ToolMessage({
            content: `Error: Herramienta '${toolCall.name}' no encontrada.`,
            tool_call_id: toolCall.id,
          }),
        );
      }
    }

    return {
      messages: [...messages, ...result],
      profileContent: updatedProfileContent,
    };
  }

  private shouldOcrContinue(state: PhotoAnalyzerState): 'ocrCall' | 'continue' {
    const lastMessage = state.messages?.at(-1);

    if (
      lastMessage?.type === 'tool' &&
      lastMessage.name === 'analyze_image_content'
    ) {
      try {
        const visionResult = JSON.parse(lastMessage.content.toString());

        if (visionResult.needs_ocr === true) {
          return 'ocrCall';
        }
      } catch (e) {
        console.error('Error al parsear el JSON de visión:', e);
        return 'continue';
      }
    }

    return 'continue';
  }

  private shouldContinue(state: PhotoAnalyzerState): 'toolCall' | 'end' {
    const lastMessage = state.messages?.at(-1);

    if (
      lastMessage &&
      lastMessage.type === 'ai' &&
      (lastMessage as AIMessage).tool_calls?.length
    ) {
      return 'toolCall';
    }

    return 'end';
  }

  async run(userId: string, urlImage: string) {
    const initialState: PhotoAnalyzerState = {
      userId: userId,
      imageReference: urlImage,
      messages: [
        new HumanMessage([
          {
            type: 'text',
            text: `Tu objetivo es generar una recomendación de comida para el usuario ${userId} basada en la imagen. 
                    
                    Sigue esta secuencia estricta de tareas usando las herramientas disponibles:
                    1.  **Perfil:** Ejecuta la herramienta 'find_profile' con el input ${userId}.
                    2.  **Visión:** Después de obtener el perfil, ejecuta la herramienta 'analyze_image_content' con el input '${urlImage}'.
                    3.  **OCR Condicional:** Evalúa el resultado JSON de 'analyze_image_content'. Si el campo 'needs_ocr' es TRUE, DEBES ejecutar la herramienta 'extract_text_ocr' con el input '${urlImage}'. Si 'needs_ocr' es FALSE, ignora este paso.
                    4.  **Decisión Final:** Con todos los datos disponibles (perfil, análisis de visión, y texto OCR si se ejecutó), compara las preferencias del usuario (alergias, scores) con el contenido detectado. Genera una respuesta amigable con una **recomendación CLARA y personalizada** (ej. "Te recomiendo... no lo pidas, choca con tu alergia...").`,
          },
        ]),
      ],
    };

    const config = {
      configurable: {
        thread_id: userId,
      },
    };

    console.log('Ejecutando agente...', initialState.userId);
    const result = await this.compliledGraph.invoke(initialState, config);

    const lastMessage = result.messages?.at(-1);
    if (lastMessage && typeof lastMessage.content === 'string') {
      return lastMessage.content;
    }

    return 'El agente terminó el flujo de trabajo, pero no se pudo extraer una respuesta final de texto.';
  }
}
