import { FirestoreProfileRepository } from './firestore-profile.repository';
import { FirestoreFoodRatingRepository } from './firestore-food-rating.repository';

export const repositories = [
  {
    provide: 'FoodRatingRepository',
    useClass: FirestoreFoodRatingRepository,
  },
  {
    provide: 'ProfileRepository',
    useClass: FirestoreProfileRepository,
  },
];
