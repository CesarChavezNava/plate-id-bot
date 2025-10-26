import * as admin from 'firebase-admin';

import { Injectable, OnModuleInit } from '@nestjs/common';
import { App, applicationDefault } from 'firebase-admin/app';
import { Firestore } from 'firebase-admin/firestore';

@Injectable()
export class FirestoreService implements OnModuleInit {
  private firebaseApp: App;
  private _db: Firestore;

  onModuleInit() {
    try {
      this.firebaseApp = admin.initializeApp({
        credential: applicationDefault(),
      });

      this._db = admin.firestore(this.firebaseApp);
      const settings = {
        timestampsInSnapshots: true,
        ignoreUndefinedProperties: true,
      };

      this._db.settings(settings);
    } catch (err) {
      console.error('Error to initialize Firebase Admin:', err);
      throw new Error(
        'Failed to connect with Firestore. Stop the application.',
      );
    }
  }

  get db(): Firestore {
    if (!this._db) {
      throw new Error(
        'Firestore not available. The module was not initialized correctly.',
      );
    }

    return this._db;
  }
}
