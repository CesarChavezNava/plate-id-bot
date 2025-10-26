import { UserStatus } from '../types/user-status';

export class User {
  constructor(
    public readonly id: string,
    public readonly status: UserStatus,
  ) {}
}
