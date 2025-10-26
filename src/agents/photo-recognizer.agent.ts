import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent, ReactAgent } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';
import { downloadAndEncodeImage } from '@modules/shared/infrastructure/utils/file.utils';
import { ProfileFinderUseCase } from '@modules/profile/application/profile-finder/profile-finder.usecase';
import { ProfileFinderInput } from '@modules/profile/application/profile-finder/profile-finder.input';
import { NoResponseFromAgentError } from './errors/no-response-from-agent.rror';
import { AgentError } from './errors/agent.error';

@Injectable()
export class PhotoRecognizerAgent {
  private readonly llm: ChatOpenAI;
  private readonly agent: ReactAgent;

  constructor(private readonly profileFinderUseCase: ProfileFinderUseCase) {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-5-mini',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.agent = createAgent({
      model: this.llm,
      tools: [],
      checkpointer: new MemorySaver(),
      systemPrompt: `You are an artificial intelligence agent expert in visual recognition, food analysis, and compatibility rating. Your task is to perform two steps:
**STEP 1: Dish Recognition**
Rigorously analyze the provided image and identify the exact name of the dish it contains. Use the following classification rules:
1.  **Successful Recognition:** Return the **most recognized common name** (e.g., "Tacos al Pastor").
2.  **UNRECOGNIZED, MANY_DISHES, GENERIC_FOOD:** Use these codes if the recognition fails based on the original rules.
**STEP 2: Compatibility Rating (Only if STEP 1 is Successful)**
If a dish name is identified, you must analyze its general ingredients and its cuisine type against the provided 'Perfil del Usuario' to assign a compatibility rating from 1 to 5:
* **Rating 1 (Low):** Contains an ingredient the user is **allergic** to, or is a dish the user **explicitly dislikes**.
* **Rating 5 (High):** Is a dish the user **explicitly likes** or is of a cuisine highly compatible with their general preferences.
* **Ratings 2-4:** Use intermediate values based on general ingredient similarity, perceived interest, or minor conflicting tastes.
**Required Response Format:**
Your response must be a **single JSON object** (no preámbulo, no explicaciones, solo el JSON) with two fields:
* \`dish_name\`: The recognized dish name (or the classification code if recognition failed: UNRECOGNIZED, MANY_DISHES, GENERIC_FOOD).
* \`compatibility_rating\`: The numerical rating (1 to 5) if a dish was recognized, or **0** if the dish was not recognized (i.e., if dish_name is one of the classification codes).
**Example of a successful response:** {"dish_name": "Pasta Carbonara", "compatibility_rating": 4}
**Example of an unrecognized response:** {"dish_name": "UNRECOGNIZED", "compatibility_rating": 0}`,
    });
  }

  async runAgent(fileUrl: string, sessionId: string): Promise<string> {
    try {
      const { base64Image, mimeType } = await downloadAndEncodeImage(fileUrl);

      const profile = await this.profileFinderUseCase.execute(
        new ProfileFinderInput(sessionId),
      );

      const likes = profile.likes.map((like) => like.foodName);
      const dislikes = profile.dislikes.map((dislike) => dislike.foodName);
      const allergies = profile.allergies.map((allergy) => allergy.foodName);

      const profileContent = `User Profile for Compatibility Analysis:
- likes: ${likes.join(', ') || 'None'}
- dislikes: ${dislikes.join(', ') || 'None'}
- allergies: ${allergies.join(', ') || 'None'}
      `;

      const imageMessageContent = [
        {
          type: 'text',
          text: `Identify the dish in the following image and then evaluate its compatibility with the following user profile: ${profileContent} Follow the strict response format.`,
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`,
            detail: 'auto',
          },
        },
      ];

      const config = {
        configurable: {
          thread_id: sessionId,
        },
      };

      const result = await this.agent.invoke(
        {
          messages: [
            {
              role: 'user',
              content: imageMessageContent,
            },
          ],
        },
        config,
      );

      const lastMessage = result.messages[result.messages.length - 1];

      if (lastMessage && 'content' in lastMessage) {
        return lastMessage.content as string;
      }

      throw new NoResponseFromAgentError();
    } catch {
      throw new AgentError();
    }
  }
}
