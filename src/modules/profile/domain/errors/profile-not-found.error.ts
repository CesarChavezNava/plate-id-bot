export class ProfileNotFoundError extends Error {
  constructor(userId: string) {
    super(`User profile with id ${userId} not found`);
  }
}
