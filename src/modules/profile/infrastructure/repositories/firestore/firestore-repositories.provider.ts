import { FirestoreFoodAllergyRepository } from './firestore-food-allergy.repository';
import { FirestoreProfileRepository } from './firestore-profile.repository';
import { FirestoreFoodRatingRepository } from './firestore-food-rating.repository';

export const repositories = [
  {
    provide: 'FoodRatingRepository',
    useClass: FirestoreFoodRatingRepository,
  },
  {
    provide: 'FoodAllergyRepository',
    useClass: FirestoreFoodAllergyRepository,
  },
  {
    provide: 'ProfileRepository',
    useClass: FirestoreProfileRepository,
  },
];
