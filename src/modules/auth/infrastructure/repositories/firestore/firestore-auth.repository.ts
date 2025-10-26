import { firestoreCollections } from '@modules/config/firestore/firestore-collections';
import { FirestoreService } from '@modules/config/firestore/firestore.service';
import { User } from '@modules/auth/domain/entities/user';
import { AuthRepository } from '@modules/auth/domain/repositories/auth.repository';
import { UserId } from '@modules/auth/domain/value-objects/user-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FirestoreAuthRepository implements AuthRepository {
  constructor(private readonly config: FirestoreService) {}

  async register(user: User): Promise<void> {
    const batch = this.config.db.batch();

    const userRef = this.config.db
      .collection(firestoreCollections.users)
      .doc(user.id);

    batch.set(userRef, {
      status: user.status,
    });

    await batch.commit();
  }

  async authorizer(userId: UserId): Promise<boolean> {
    const userSnapshot = await this.config.db
      .collection(firestoreCollections.users)
      .doc(userId.value)
      .get();

    if (!userSnapshot.exists) {
      return false;
    }

    const status = userSnapshot.data().status;
    return status === 'ACTIVE';
  }
}
