import { Runnable } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { RegisterFoodScoreTool } from '@tools/register-food-score.tool';
import {
  AgentSteps,
  FoodRaterState,
  FoodRaterStateSchema,
} from './food-rater.state';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { END, MemorySaver, START, StateGraph } from '@langchain/langgraph';

type FoodRaterToolType = RegisterFoodScoreTool;

@Injectable()
export class FoodRaterAgent {
  private readonly model: Runnable<any, any>;
  private readonly graph: any;
  private toolsByName: Record<string, FoodRaterToolType>;

  constructor(private readonly registerFoodScoreTool: RegisterFoodScoreTool) {
    this.toolsByName = {
      [this.registerFoodScoreTool.name]: this.registerFoodScoreTool,
    };

    const tools = Object.values(this.toolsByName);
    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      openAIApiKey: process.env.OPENAI_API_KEY,
    }).bindTools(tools) as Runnable<any, any>;

    this.graph = this.buildGraph();
  }

  private async llmCall(
    state: FoodRaterState,
  ): Promise<{ messages: BaseMessage[] }> {
    const messages = state.messages || [];
    const response = await this.model.invoke(state.messages);

    return {
      messages: [...messages, response],
    };
  }

  private async toolNode(state: FoodRaterState) {
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

    for (const toolCall of aiMessage.tool_calls) {
      const tool = this.toolsByName[toolCall.name];

      if (tool) {
        const inputString = toolCall.args.input;
        const input = JSON.parse(inputString);
        input.userId = state.userId;

        const output = await tool._call(JSON.stringify(input));

        result.push(
          new ToolMessage({
            content: JSON.stringify(output),
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
      ...state,
      messages: [...messages, ...result],
    };
  }

  private shouldContinue(state: FoodRaterState): string {
    const lastMessage = state.messages.at(-1);

    if (
      lastMessage &&
      lastMessage.type === 'ai' &&
      (lastMessage as AIMessage).tool_calls?.length
    ) {
      return AgentSteps.CallTool;
    }

    if (lastMessage instanceof ToolMessage) {
      return AgentSteps.Respond;
    }

    return END;
  }

  private buildGraph() {
    const workflow = new StateGraph(FoodRaterStateSchema);

    workflow
      .addNode(AgentSteps.CallTool, this.toolNode.bind(this))
      .addNode(AgentSteps.Respond, this.llmCall.bind(this))
      .addEdge(START, AgentSteps.Respond)
      .addConditionalEdges(AgentSteps.Respond, this.shouldContinue.bind(this), {
        [AgentSteps.CallTool]: AgentSteps.CallTool,
        [AgentSteps.Respond]: AgentSteps.Respond,
        [END]: END,
      })
      .addEdge(AgentSteps.CallTool, AgentSteps.Respond);

    return workflow.compile({ checkpointer: new MemorySaver() });
  }

  async run(state: FoodRaterState): Promise<FoodRaterState> {
    const { messages, lastFoodAnalyzed } = state;
    const userQuery = (messages.at(-1) as HumanMessage).content as string;

    const contextFood = lastFoodAnalyzed
      ? `El último platillo analizado en la conversación fue: "${lastFoodAnalyzed}". ÚSALO como el nombre del platillo si el usuario NO especifica uno en su mensaje.`
      : 'No hay un platillo previo conocido. Si el usuario no menciona el nombre, tu respuesta FINAL debe ser amigable y pedirle que aclare a qué platillo se refiere.';

    const systemPrompt = `¡Órale! Eres un Agente de Feedback experto en sentimiento y registro de scores. Tu misión es asignar y registrar una puntuación del 1 al 5.
            
            **REGLAS DE ASIGNACIÓN DE SCORE (si el usuario NO da un número explícito):**
            -   **Score 5:** Sentimiento Muy Positivo (ej. 'me encantó', 'delicioso', 'el mejor').
            -   **Score 4 (Default Positivo):** Sentimiento Positivo (ej. 'me gustó', 'estaba bien'). ÚSALO como default positivo si solo dice que le gustó.
            -   **Score 3:** Sentimiento Neutro.
            -   **Score 2 (Default Negativo):** Sentimiento Negativo Implícito (ej. 'no me gustó', 'malo'). ÚSALO como default negativo.
            -   **Score 1:** Sentimiento Fuertemente Negativo (ej. 'odié', 'pésimo', 'un asco').
            
            **REGLAS DE REGISTRO Y PRIORIDAD:**
            1.  **Nombre del platillo:** **PRIORIZA** el platillo que el usuario nombre en su consulta.
            2.  **FALLBACK:** Si el usuario NO nombra un platillo, usa el contexto: "${contextFood}".
            3.  **Acción:** DEBES usar la herramienta 'register_food_score' con el 'userId', el 'foodName' inferido y el 'score'.
            `;

    const initialState: FoodRaterState = {
      userId: state.userId,
      messages: [
        new SystemMessage(systemPrompt),
        new HumanMessage([
          {
            type: 'text',
            text: userQuery,
          },
        ]),
      ],
    };

    const config = {
      configurable: {
        thread_id: state.userId,
      },
    };

    const result = await this.graph.invoke(initialState, config);
    return result as FoodRaterState;
  }
}
