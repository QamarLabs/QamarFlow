import type { RefreshToken, User } from '../domain/user.js';

export interface UserRepository {
  findById(id: string): User | undefined;
  findByEmail(email: string): User | undefined;
  insert(user: User): void;
}
export interface RefreshTokenRepository {
  insert(token: RefreshToken): void;
  findByHash(hash: string): RefreshToken | undefined;
  revoke(id: string, at: string): void;
  revokeAllForUser(userId: string, at: string): void;
}
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}
export interface TokenIssuer {
  signAccess(userId: string): string;
  verifyAccess(token: string): { userId: string } | null;
}
