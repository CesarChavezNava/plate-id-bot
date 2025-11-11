import { FoodRaterInput } from '@modules/profile/application/food-rater/food-rater.input';
import { FoodRaterUseCase } from '@modules/profile/application/food-rater/food-rater.usecase';
import { Injectable } from '@nestjs/common';
import { Tool } from 'langchain';

@Injectable()
export class RegisterFoodScoreTool extends Tool {
  public name = 'register_food_score';
  public description = `Registra la puntuación (score) que un usuario asigna a un platillo. El input DEBE incluir tres argumentos: userId, el foodName (nombre del platillo), y el score (puntuación del 1 al 5), si el usuario no asignó la puntuación, el score debe ser 4.`;

  constructor(private readonly foodRaterUseCase: FoodRaterUseCase) {
    super();
  }

  public async _call(arg: any): Promise<string> {
    let args: any;

    try {
      args = JSON.parse(arg);
    } catch {
      return 'Error: El input debe ser un string JSON con los campos userId, foodName, y score.';
    }

    const { userId, foodName, score } = args;
    await this.foodRaterUseCase.execute(
      new FoodRaterInput(userId, foodName, score),
    );

    return `Score de ${score}/5 registrado con éxito para el platillo ${foodName} del usuario ${userId}.`;
  }
}
