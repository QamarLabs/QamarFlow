import { createHash, randomBytes } from 'node:crypto';
import { conflict, notFound, unauthorized } from '../../../shared/errors.js';
import { newId } from '../../../shared/id.js';
import { type Clock, iso } from '../../../shared/clock.js';
import type { EventBus } from '../../../shared/event-bus.js';
import { normalizeEmail, toUserDto, toPublicUser, usernameFromEmail, type User, type UserDto } from '../domain/user.js';
import type { PasswordHasher, RefreshTokenRepository, TokenIssuer, UserRepository } from './ports.js';

export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export interface AuthResult { accessToken: string; refreshToken: string; user: UserDto }

export class AuthService {
  constructor(
    private users: UserRepository,
    private tokens: RefreshTokenRepository,
    private hasher: PasswordHasher,
    private issuer: TokenIssuer,
    private clock: Clock,
    private bus: EventBus,
  ) {}

  async register(input: { email: string; password: string; fullName?: string }): Promise<AuthResult> {
    const email = normalizeEmail(input.email);
    if (this.users.findByEmail(email)) throw conflict('Email already registered');
    const user: User = {
      id: newId(), email, username: usernameFromEmail(email), fullName: input.fullName?.trim() ?? '',
      avatarUrl: null, passwordHash: await this.hasher.hash(input.password), role: 'Employee',
      company: null, createdAt: iso(this.clock.now()),
    };
    this.users.insert(user);
    await this.bus.publish({ type: 'UserRegistered', userId: user.id });
    return this.issue(user);
  }

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    let email: string;
    try { email = normalizeEmail(input.email); } catch { throw unauthorized('Invalid email or password'); }
    const user = this.users.findByEmail(email);
    const ok = user?.passwordHash ? await this.hasher.verify(input.password, user.passwordHash) : false;
    if (!user || !ok) throw unauthorized('Invalid email or password');
    await this.bus.publish({ type: 'UserSignedIn', userId: user.id });
    return this.issue(user);
  }

  /** Rotates the refresh token. Reusing a revoked token revokes every token of that user. */
  refresh(raw: string | undefined): AuthResult {
    if (!raw) throw unauthorized('Missing refresh token');
    const now = this.clock.now();
    const token = this.tokens.findByHash(sha256(raw));
    if (!token) throw unauthorized('Invalid refresh token');
    if (token.revokedAt) {
      this.tokens.revokeAllForUser(token.userId, iso(now));
      throw unauthorized('Refresh token reused');
    }
    if (new Date(token.expiresAt) <= now) throw unauthorized('Refresh token expired');
    const user = this.users.findById(token.userId);
    if (!user) throw unauthorized('Invalid refresh token');
    this.tokens.revoke(token.id, iso(now));
    return this.issue(user);
  }

  logout(raw: string | undefined): void {
    if (!raw) return;
    const token = this.tokens.findByHash(sha256(raw));
    if (token && !token.revokedAt) this.tokens.revoke(token.id, iso(this.clock.now()));
  }

  me(userId: string): UserDto {
    const u = this.users.findById(userId);
    if (!u) throw unauthorized();
    return toUserDto(u);
  }

  getUser(id: string) {
    const u = this.users.findById(id);
    if (!u) throw notFound('User');
    return toPublicUser(u);
  }

  findByEmail(raw: string) {
    let email: string;
    try { email = normalizeEmail(raw); } catch { return null; }
    const u = this.users.findByEmail(email);
    return u ? toPublicUser(u) : null;
  }

  /** Used by other contexts (Customer/Supplier) to read the current user's email. */
  emailOf(userId: string): string | undefined { return this.users.findById(userId)?.email; }

  verifyAccessToken(token: string) { return this.issuer.verifyAccess(token); }

  private issue(user: User): AuthResult {
    const refreshToken = randomBytes(32).toString('base64url');
    this.tokens.insert({
      id: newId(), userId: user.id, tokenHash: sha256(refreshToken),
      expiresAt: iso(new Date(this.clock.now().getTime() + REFRESH_TTL_MS)), revokedAt: null,
    });
    return { accessToken: this.issuer.signAccess(user.id), refreshToken, user: toUserDto(user) };
  }
}
