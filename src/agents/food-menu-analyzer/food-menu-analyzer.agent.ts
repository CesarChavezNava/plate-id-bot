import { MemorySaver } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { ProfileFinderUseCase } from '@modules/profile/application/profile-finder/profile-finder.usecase';
import { Injectable } from '@nestjs/common';

import {
  createAgent,
  HumanMessage,
  ReactAgent,
  SystemMessage,
} from 'langchain';
import { prompt } from './food-menu-analyzer.prompt';
import { downloadAndEncodeImage } from '@modules/shared/infrastructure/utils/file.utils';
import { ProfileFinderInput } from '@modules/profile/application/profile-finder/profile-finder.input';
import { NoResponseFromAgentError } from '@agents/errors/no-response-from-agent.rror';
import { AgentRequestError } from '@agents/errors/agent-request.error';

@Injectable()
export class FoodMenuAnalyzerAgent {
  private readonly llm: ChatOpenAI;
  private readonly agent: ReactAgent;

  constructor(private readonly profileFinderUseCase: ProfileFinderUseCase) {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-5-mini',
      openAIApiKey: process.env.OPENAI_API_KEY,
      service_tier: 'priority',
    });

    this.agent = createAgent({
      model: this.llm,
      tools: [],
      checkpointer: new MemorySaver(),
    });
  }

  async runAgent(fileUrl: string, sessionId: string): Promise<string> {
    try {
      const { base64Image, mimeType } = await downloadAndEncodeImage(fileUrl);

      const profile = await this.profileFinderUseCase.execute(
        new ProfileFinderInput(sessionId),
      );

      const foods = profile.food.map(
        (rating) => `${rating.food.name} | ${rating.score}`,
      );
      const allergies = profile.allergies.map((allergy) => allergy.food.name);

      const profileContent = `
        - foods: ${foods.join(', ') || 'None'}
        - allergies: ${allergies.join(', ') || 'None'}
        `;

      const messages = [
        new SystemMessage(prompt.system('spanish')),
        new HumanMessage([
          {
            type: 'text',
            text: prompt.human('spanish', profileContent),
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
              detail: 'auto',
            },
          },
        ]),
      ];

      const config = {
        configurable: {
          thread_id: sessionId,
        },
      };

      const result = await this.agent.invoke(
        {
          messages: messages,
        },
        config,
      );

      const lastMessage = result.messages[result.messages.length - 1];

      if (lastMessage && 'content' in lastMessage) {
        return lastMessage.content as string;
      }

      throw new NoResponseFromAgentError();
    } catch (err) {
      console.error('Error while running agent:', err);
      throw new AgentRequestError();
    }
  }
}
