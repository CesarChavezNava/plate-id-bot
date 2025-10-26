import { Module } from '@nestjs/common';
import { FirestoreModule } from '@modules/config/firestore/firestore.module';
import { usesCases } from '@modules/profile/application/usescases.provider';
import { repositories } from '@modules/profile/infrastructure/repositories/firestore/firestore-repositories.provider';

@Module({
  imports: [FirestoreModule],
  providers: [...repositories, ...usesCases],
  exports: [...usesCases],
})
export class ProfileModule {}
