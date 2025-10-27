import { Injectable } from '@nestjs/common';
import { firestoreCollections } from '@modules/config/firestore/firestore-collections';
import { FirestoreService } from '@modules/config/firestore/firestore.service';
import { Profile } from '@modules/profile/domain/entities/profile';
import { FoodRating } from '@modules/profile/domain/entities/food-rating';
import { ProfileRepository } from '@modules/profile/domain/repositories/profile.repository';
import { Food } from '@modules/profile/domain/entities/food';

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
    const allergies = [];
    const foodDocs = await profileSnapshot.ref
      .collection(firestoreCollections.food)
      .get();

    foodDocs.forEach((doc) => {
      if (doc.data().score === 0)
        allergies.push(
          FoodRating.new(
            userId,
            doc.data().score,
            Food.new(doc.id, doc.data().foodName),
          ),
        );
      else
        food.push(
          FoodRating.new(
            userId,
            doc.data().score,
            Food.new(doc.id, doc.data().foodName),
          ),
        );
    });

    const profile = new Profile(userId, food, allergies);
    return profile;
  }
}
