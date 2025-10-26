import { FirestoreAuthRepository } from './firestore-auth.repository';

export const repositories = [
  {
    provide: 'AuthRepository',
    useClass: FirestoreAuthRepository,
  },
];
