import { Food } from './food';

export class FoodRating {
  private constructor(
    public readonly userId: string,
    public readonly score: number,
    public readonly food: Food,
  ) {}

  static create(userId: string, score: number, food: Food): FoodRating {
    const minScore = 1;
    const maxScore = 5;

    if (score < minScore) {
      score = minScore;
    }

    if (score > maxScore) {
      score = maxScore;
    }
    return new FoodRating(userId, score, food);
  }

  static new(userId: string, score: number, food: Food): FoodRating {
    return new FoodRating(userId, score, food);
  }
}
