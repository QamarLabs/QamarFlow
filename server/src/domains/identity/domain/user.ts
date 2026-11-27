export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  passwordHash: string | null;
  role: string;
  company: string | null;
  createdAt: string;
}

export { normalizeEmail } from '../../../shared/email.js';

/** Username is derived from the email local part, as the legacy app did. */
export const usernameFromEmail = (email: string): string => email.split('@')[0];

export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
}

export type UserDto = Omit<User, 'passwordHash'>;
export type PublicUserDto = Pick<User, 'id' | 'username' | 'fullName' | 'avatarUrl' | 'email'>;

export const toUserDto = ({ passwordHash: _p, ...u }: User): UserDto => u;
export const toPublicUser = (u: User): PublicUserDto => ({
  id: u.id, username: u.username, fullName: u.fullName, avatarUrl: u.avatarUrl, email: u.email,
});
