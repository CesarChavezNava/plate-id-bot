import { RatingType } from '@modules/profile/domain/types/rating.type';

export class FoodRatingCriteria {
  constructor(
    public readonly userId: string,
    public readonly rating: RatingType,
  ) {}
}
