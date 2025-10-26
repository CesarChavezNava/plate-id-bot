import { firestoreCollections } from '@modules/config/firestore/firestore-collections';
import { FirestoreService } from '@modules/config/firestore/firestore.service';
import { FoodAllergy } from '@modules/profile/domain/entities/food-allergy';
import { FoodAllergyCriteria } from '@modules/profile/domain/entities/food-allergy-criteria';
import { FoodAllergyRepository } from '@modules/profile/domain/repositories/food-allergy.repository';
import { Injectable } from '@nestjs/common';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class FirestoreFoodAllergyRepository implements FoodAllergyRepository {
  constructor(private readonly config: FirestoreService) {}

  async add(allergy: FoodAllergy): Promise<void> {
    const batch = this.config.db.batch();

    const profileRef = this.config.db
      .collection(firestoreCollections.profiles)
      .doc(allergy.userId);

    batch.set(profileRef, {
      updatedAt: FieldValue.serverTimestamp(),
    });

    const allergyRef = profileRef
      .collection(firestoreCollections.allergies)
      .doc(allergy.allergyId);

    batch.set(allergyRef, {
      foodName: allergy.foodName,
    });

    await batch.commit();
  }

  async search(criteria: FoodAllergyCriteria): Promise<FoodAllergy[]> {
    const allergiesQuerySnapshot = await this.config.db
      .collection(firestoreCollections.profiles)
      .doc(criteria.userId)
      .collection(firestoreCollections.allergies)
      .get();

    const allergies: FoodAllergy[] = [];
    allergiesQuerySnapshot.forEach((doc) => {
      const foodAllergy = new FoodAllergy(criteria.userId, doc.data().foodName);

      allergies.push(foodAllergy);
    });

    return allergies;
  }
}
