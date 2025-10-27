export class FoodRaterInput {
  constructor(
    public readonly userId: string,
    public readonly foodName: string,
    public readonly score: number,
  ) {}
}
