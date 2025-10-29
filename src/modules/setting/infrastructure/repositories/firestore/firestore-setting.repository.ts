import { firestoreCollections } from '@modules/config/firestore/firestore-collections';
import { FirestoreService } from '@modules/config/firestore/firestore.service';
import { Setting } from '@modules/setting/domain/entities/setting';
import { SettingsRepository } from '@modules/setting/domain/repositories/settings.repository';
import { Injectable } from '@nestjs/common';
import { WriteBatch } from 'firebase-admin/firestore';

@Injectable()
export class FirestoreSettingRepository implements SettingsRepository {
  constructor(private readonly config: FirestoreService) {}

  async set(userId: string, setting: Setting): Promise<void> {
    const batch: WriteBatch = this.config.db.batch();

    const userRef = this.config.db
      .collection(firestoreCollections.users)
      .doc(userId)
      .collection(firestoreCollections.settings)
      .doc(setting.key);

    batch.set(userRef, {
      value: setting.value,
    });

    await batch.commit();
  }

  async get(userId: string, key: string): Promise<Setting> {
    const snapshot = await this.config.db
      .collection(firestoreCollections.users)
      .doc(userId)
      .collection(firestoreCollections.settings)
      .doc(key)
      .get();

    if (!snapshot.exists) return null;
    return new Setting(key, snapshot.data().value);
  }
}
