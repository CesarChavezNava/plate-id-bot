import { Injectable } from '@nestjs/common';
import { firestoreCollections } from '@modules/config/firestore/firestore-collections';
import { FirestoreService } from '@modules/config/firestore/firestore.service';
import { FoodAllergy } from '@modules/profile/domain/entities/food-allergy';
import { Profile } from '@modules/profile/domain/entities/profile';
import { FoodRating } from '@modules/profile/domain/entities/food-rating';
import { ProfileRepository } from '@modules/profile/domain/repositories/profile.repository';

@Injectable()
export class FirestoreProfileRepository implements ProfileRepository {
  constructor(private readonly config: FirestoreService) {}

  async find(userId: string): Promise<Profile> {
    const profileSnapshot = await this.config.db
      .collection(firestoreCollections.profiles)
      .doc(userId)
      .get();

    if (!profileSnapshot.exists) return null;

    const food = [];
    const foodDocs = await profileSnapshot.ref
      .collection(firestoreCollections.dishes)
      .get();

    foodDocs.forEach((doc) => {
      food.push(new FoodRating(userId, doc.data().foodName, doc.data().rating));
    });

    const allergies = [];
    const allergyDocs = await profileSnapshot.ref
      .collection(firestoreCollections.allergies)
      .get();
    allergyDocs.forEach((doc) => {
      allergies.push(new FoodAllergy(userId, doc.data().foodName));
    });

    const profile = new Profile(userId, food, allergies);
    return profile;
  }
}
