import * as z from 'zod';

import { Runnable } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { MetaState, MetaStateSchema } from './meta.state';
import { Prompts } from './meta.prompt';
import { PhotoAnalizerAgent } from '@agents/photo-analyzer/photo-analyzer.agent';
import { END, START, StateGraph } from '@langchain/langgraph';
import { FoodRaterAgent } from '@agents/food-rater/food-rater.agent';
import { AIMessage } from '@langchain/core/messages';

@Injectable()
export class MetaAgent {
  routerSchema = z.object({
    nextAgent: z.enum(['photoAnalyzer', 'foodRater', 'defaultResponse']),
  });

  private readonly model: Runnable;
  private readonly graph: any;

  constructor(
    private readonly photoAnalyzerAgent: PhotoAnalizerAgent,
    private readonly foodRaterAgent: FoodRaterAgent,
  ) {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      openAIApiKey: process.env.OPENAI_API_KEY,
    }).withStructuredOutput(this.routerSchema) as Runnable;

    this.graph = this.buildGraph();
  }

  private buildGraph() {
    const workflow = new StateGraph(MetaStateSchema);

    workflow
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .addNode('router_node', async (state: MetaState) => {})
      .addNode(
        'photoAnalyzer',
        this.photoAnalyzerAgent.run.bind(this.photoAnalyzerAgent),
      )
      .addNode('foodRater', this.foodRaterAgent.run.bind(this.foodRaterAgent))
      .addNode('defaultResponse', this.defaultResponse.bind(this))
      .addEdge(START, 'router_node')
      .addConditionalEdges('router_node', this.router.bind(this), {
        photoAnalyzer: 'photoAnalyzer',
        foodRater: 'foodRater',
        defaultResponse: 'defaultResponse',
      })
      .addEdge('photoAnalyzer', END)
      .addEdge('foodRater', END)
      .addEdge('defaultResponse', END);

    return workflow.compile();
  }

  private async router(state: MetaState) {
    const lastMessage = state.messages.at(-1);

    const result = await this.model.invoke(Prompts.value(lastMessage));
    const decision = JSON.parse(JSON.stringify(result));

    return decision.nextAgent;
  }

  private async defaultResponse(state: MetaState) {
    return {
      messages: [
        ...state.messages,
        new AIMessage(
          '¡Qué onda! Ahorita solo puedo ayudarte a calificar comidas o a analizar fotos. Échame una de esas dos cosas para que te ayude, ¡ándale! 😉',
        ),
      ],
    };
  }

  async run(state: MetaState) {
    const result = await this.graph.invoke(state);

    const lastMessage = result.messages?.at(-1);
    if (lastMessage && typeof lastMessage.content === 'string') {
      return lastMessage.content;
    }
    return 'Ocurrió un error inesperado al dirigir la consulta.';
  }
}
