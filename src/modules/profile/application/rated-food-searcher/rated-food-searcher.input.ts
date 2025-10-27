export class RatedFoodSearcherInput {
  constructor(
    public readonly userId: string,
    public readonly allergies: boolean = false,
  ) {}
}
