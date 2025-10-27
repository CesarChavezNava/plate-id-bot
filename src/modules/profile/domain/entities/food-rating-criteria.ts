export class FoodRatingCriteria {
  constructor(
    public readonly userId: string,
    public readonly allergies: boolean = false,
  ) {}
}
