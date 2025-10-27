import { Injectable } from '@nestjs/common';
import { FieldValue, WriteBatch } from 'firebase-admin/firestore';
import { firestoreCollections } from '@modules/config/firestore/firestore-collections';
import { FirestoreService } from '@modules/config/firestore/firestore.service';
import { FoodRating } from '@modules/profile/domain/entities/food-rating';
import { FoodRatingCriteria } from '@modules/profile/domain/entities/food-rating-criteria';
import { FoodRatingRepository } from '@modules/profile/domain/repositories/food-rating.repository';
import { Food } from '@modules/profile/domain/entities/food';

@Injectable()
export class FirestoreFoodRatingRepository implements FoodRatingRepository {
  constructor(private readonly config: FirestoreService) {}

  async save(rating: FoodRating): Promise<void> {
    const batch: WriteBatch = this.config.db.batch();

    const profileRef = this.config.db
      .collection(firestoreCollections.profiles)
      .doc(rating.userId);

    batch.set(profileRef, {
      updatedAt: FieldValue.serverTimestamp(),
    });

    const dishRef = profileRef
      .collection(firestoreCollections.food)
      .doc(rating.food.id);

    batch.set(dishRef, {
      name: rating.food.name,
      score: rating.score,
    });

    await batch.commit();
  }

  async search(criteria: FoodRatingCriteria): Promise<FoodRating[]> {
    const query = this.config.db
      .collection(firestoreCollections.profiles)
      .doc(criteria.userId)
      .collection(firestoreCollections.food);

    let foodDocs;
    if (criteria.allergies) {
      foodDocs = await query.where('score', '==', 0).get();
    } else {
      foodDocs = await query.where('score', '>', 0).get();
    }

    const food: FoodRating[] = [];
    foodDocs.forEach((doc) => {
      food.push(
        FoodRating.new(
          criteria.userId,
          doc.data().score,
          Food.new(doc.id, doc.data().name),
        ),
      );
    });

    return food;
  }
}
