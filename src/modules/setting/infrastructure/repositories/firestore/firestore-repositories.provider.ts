import { FirestoreSettingRepository } from './firestore-setting.repository';

export const repositories = [
  {
    provide: 'SettingRepository',
    useClass: FirestoreSettingRepository,
  },
];
