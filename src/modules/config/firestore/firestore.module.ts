import { Module } from '@nestjs/common';
import { FirestoreService } from '@modules/config/firestore/firestore.service';

@Module({
  providers: [FirestoreService],
  exports: [FirestoreService],
})
export class FirestoreModule {}
