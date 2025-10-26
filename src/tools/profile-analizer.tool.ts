import { Tool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';

interface DishDetails {
  name: string;
  ingredients: string[];
}
interface MenuDetails {
  dishes: DishDetails[];
}

interface ProfileToolInput {
  dishDetails: DishDetails | MenuDetails;
  profileContent: string;
}

export class ProfileAnalizerTool extends Tool {
  private readonly llm: ChatOpenAI;
  name = 'profile_analizer';
  description =
    'Analyzes the dish or menu against the user profile. Returns a JSON object with a compatibility score (1-5) if it is a dish, or a list of 5 recommendations if it is a menu.';

  constructor(apiKey: string) {
    super();
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      openAIApiKey: apiKey,
    });
  }

  protected async _call(input: string): Promise<string> {
    const parsedInput = JSON.parse(input) as ProfileToolInput;
    const { dishDetails, profileContent } = parsedInput;
    const isMenu = Array.isArray((dishDetails as MenuDetails).dishes);

    let prompt: string;
    let exampleJson: string;

    if (isMenu) {
      const dishList = (dishDetails as MenuDetails).dishes
        .map((dish) => dish.name)
        .join(', ');

      prompt = `You are an expert recommendation agent. Your task is to analyze the following Menu and the User Profile.
        Available Menu: ${dishList}
        Menu Details (for reference): ${JSON.stringify(dishDetails)}
        User Profile: ${profileContent}
        
        Your sole task is to select the **5 dishes from the Menu** that are most compatible with the user's preferences (likes) and do not contain their aversions/allergies.
        Your response must be a **single JSON object** with a "recommendations" field.`;

      exampleJson = `
        {
          "recommendations": ["Chicken with Herbs", "Mediterranean Salad", "Chocolate Tart", "Orange Juice", "Fried Fish"]
        }`;
    } else {
      const dishName = (dishDetails as DishDetails).name || 'The analyzed dish';

      prompt = `You are a compatibility analysis agent. Your task is to generate a compatibility index for the dish: "${dishName}", using the user's profile.  
        Dish Details: ${JSON.stringify(dishDetails)}
        User Profile: ${profileContent}

        Your response must be a **single JSON object** with a "compatibility" field, which is an integer from 1 (Poor compatibility/Danger) to 5 (Excellent compatibility/Totally safe).
        Criteria:
        - Allergies present: 1 or 2.
        - Aversions (dislikes) present: Maximum 3.
        - Likes present: Add points.
        - Neutral: 4.
        
        `;
      exampleJson = `
        {
          "compatibility": 4
        }`;
    }

    const finalPrompt = `${prompt}\n\nRequired Output Format (Strict JSON):\n${exampleJson}`;
    const response = await this.llm.invoke(finalPrompt);

    return response.content.toString();
  }
}
