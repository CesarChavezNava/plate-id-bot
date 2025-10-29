import { Module } from '@nestjs/common';
import { useCases } from './application/usecases.provider';
import { repositories } from './infrastructure/repositories/firestore/firestore-repositories.provider';
import { FirestoreModule } from '@modules/config/firestore/firestore.module';

@Module({
  imports: [FirestoreModule],
  providers: [...repositories, ...useCases],
  exports: [...useCases],
})
export class SettingModule {}
