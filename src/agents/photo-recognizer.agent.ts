import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent, ReactAgent } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';
import { downloadAndEncodeImage } from '@modules/shared/infrastructure/utils/file.utils';
import { ProfileFinderUseCase } from '@modules/profile/application/profile-finder/profile-finder.usecase';
import { ProfileFinderInput } from '@modules/profile/application/profile-finder/profile-finder.input';
import { NoResponseFromAgentError } from './errors/no-response-from-agent.rror';
import { AgentError } from './errors/agent.error';
import { ProfileAnalizerTool } from '@tools/profile-analizer.tool';

@Injectable()
export class PhotoRecognizerAgent {
  private readonly llm: ChatOpenAI;
  private readonly agent: ReactAgent;
  private readonly profileAnalizerTool: ProfileAnalizerTool;

  constructor(private readonly profileFinderUseCase: ProfileFinderUseCase) {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-5-mini',
      openAIApiKey: process.env.OPENAI_API_KEY,
      service_tier: 'priority',
    });

    this.profileAnalizerTool = new ProfileAnalizerTool(
      process.env.OPENAI_API_KEY,
    );

    this.agent = createAgent({
      model: this.llm,
      tools: [this.profileAnalizerTool],
      checkpointer: new MemorySaver(),
      systemPrompt: `You are an expert AI agent specializing in visual recognition and food analysis. Your workflow is:
1. **Visual Classification:** Analyze the image using the Classification Rules (RECOGNIZED, MENU, etc.).
2. **Detail Analysis:** If the code is RECOGNIZED or MENU, extract the details (name, ingredients).
3. **Profile Analysis:** If the user's profile and food details are provided, you must use the \`${this.profileAnalizerTool.name}\` tool to generate the compatibility/recommendation analysis.
4. **Final Response:** Combine all results into the Required Response Format.

Classification Rules:
1. Recognized Dish: If the image is a recognizable food dish, use the code RECOGNIZED.
2. Identified Menu: If the image is a food menu (list of options), use the code MENU.
3. Many Dishes: If the image contains multiple distinct dishes (e.g., a buffet or a table with several dishes), use the code MANY_DISHES.
4. Generic Food: If it is food, but a specific dish cannot be identified (e.g., only French fries), use the code GENERIC_FOOD.
5. Unrecognized: If the content cannot be classified, use the code UNRECOGNIZED.

Detail Instructions (Conditional):

A. For Recognized Dish (RECOGNIZED):
If the classification is **RECOGNIZED**, include the **"dish"** property in the final JSON. In this property, provide the specific name of the dish (in Spanish) and a concise list of the main ingredients you could identify visually.

B. For Identified Menu (MENU):
If the classification is **MENU**, include the **"dishes"** property in the final JSON. This property must be an **array of objects** with the following fields for each dish identified on the menu:
- "name": The name of the dish as it appears on the menu.
- "ingredients": A list of the main ingredients associated with that dish, if identifiable. If there are no clear or sufficient ingredients to infer, use an empty list [].

**Compatibility Instruction:**
If you have extracted the food information (RECOGNIZED or MENU code) and have access to the user's profile, the final response must include an **"analysis"** field containing the JSON returned by the \`${this.profileAnalizerTool.name}\` tool.

- If the code was RECOGNIZED, the "analysis" field must contain the object with the compatibility score (e.g., {"compatibility": 4}).
- If the code was MENU, the "analysis" field must contain the object with the recommendations array (e.g., {"recommendations": [...]}).

Required Response Format:
Your response must be a single JSON object (no preamble, no explanations, just the JSON) with the fields "recognitionCode", "dish" (or "dishes"), and optionally **"analysis"**.

Example RECOGNIZED with Profile:
{
  "recognitionCode": "RECOGNIZED",
  "dish": {
    "name": "Paella de Marisco",
    "ingredients": ["arroz", "gambas", "mejillones", "pimiento", "azafrán"]
  },
  "analysis": {
    "compatibility": 2
  }
}

Example MENU with Profile:
{
  "recognitionCode": "MENU",
  "dishes": [
    {
      "name": "Sopa de Cebolla",
      "ingredients": ["cebolla", "caldo de res", "pan", "queso gruyère"]
    },
    // ... more dishes
  ],
  "analysis": {
    "recommendations": ["Sopa de Cebolla", "Pechuga de Pollo a la Plancha", "Ensalada", "Jugo de Manzana", "Pastel de Tres Leches"]
  }
}

Example UNRECOGNIZED: {"recognitionCode": "UNRECOGNIZED"}`,
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
          text: `Analyze the image. Then, apply the compatibility analysis using the \`${this.profileAnalizerTool.name}\` tool with the following profile information (after identifying the dish/menu):
            ${profileContent}
            **Your sole response must be the strict final JSON object**, combining the visual classification, food details, and compatibility analysis.`,
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
    } catch (err) {
      console.error('Error while running agent:', err);
      throw new AgentError();
    }
  }
}
