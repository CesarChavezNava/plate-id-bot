import { Injectable } from '@nestjs/common';
import { FieldValue, WriteBatch } from 'firebase-admin/firestore';
import { firestoreCollections } from '@modules/config/firestore/firestore-collections';
import { FirestoreService } from '@modules/config/firestore/firestore.service';
import { FoodRating } from '@modules/profile/domain/entities/food-rating';
import { FoodRatingCriteria } from '@modules/profile/domain/entities/food-rating-criteria';
import { FoodRatingRepository } from '@modules/profile/domain/repositories/food-rating.repository';

@Injectable()
export class FirestoreFoodRatingRepository implements FoodRatingRepository {
  constructor(private readonly config: FirestoreService) {}

  async save(food: FoodRating): Promise<void> {
    const batch: WriteBatch = this.config.db.batch();

    const profileRef = this.config.db
      .collection(firestoreCollections.profiles)
      .doc(food.userId);

    batch.set(profileRef, {
      updatedAt: FieldValue.serverTimestamp(),
    });

    const dishRef = profileRef
      .collection(firestoreCollections.dishes)
      .doc(food.foodId);

    batch.set(dishRef, {
      foodName: food.foodName,
      rating: food.rating,
    });

    await batch.commit();
  }

  async search(criteria: FoodRatingCriteria): Promise<FoodRating[]> {
    const foodDocs = await this.config.db
      .collection(firestoreCollections.profiles)
      .doc(criteria.userId)
      .collection(firestoreCollections.dishes)
      .where('rating', '==', criteria.rating)
      .get();

    const food: FoodRating[] = [];
    foodDocs.forEach((doc) => {
      food.push(
        new FoodRating(criteria.userId, doc.data().foodName, doc.data().rating),
      );
    });

    return food;
  }
}
