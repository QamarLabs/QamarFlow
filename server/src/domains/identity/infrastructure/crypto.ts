import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { PasswordHasher, TokenIssuer } from '../application/ports.js';

export class BcryptHasher implements PasswordHasher {
  constructor(private rounds = 12) {}
  hash(plain: string) { return bcrypt.hash(plain, this.rounds); }
  verify(plain: string, hash: string) { return bcrypt.compare(plain, hash); }
}

export class JwtTokenIssuer implements TokenIssuer {
  constructor(private secret: string, private ttlSeconds = 15 * 60) {}
  signAccess(userId: string) {
    return jwt.sign({}, this.secret, { subject: userId, expiresIn: this.ttlSeconds, algorithm: 'HS256' });
  }
  verifyAccess(token: string) {
    try {
      const p = jwt.verify(token, this.secret, { algorithms: ['HS256'] });
      return typeof p === 'object' && p.sub ? { userId: p.sub } : null;
    } catch { return null; }
  }
}
