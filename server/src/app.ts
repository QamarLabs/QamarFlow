import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import type { Config } from './shared/config.js';
import { systemClock, type Clock } from './shared/clock.js';
import { EventBus } from './shared/event-bus.js';
import { DomainError } from './shared/errors.js';
import { errorHandler } from './shared/http.js';
import type { Db } from './infrastructure/db/connection.js';
import { sqliteUnitOfWork } from './infrastructure/db/unit-of-work.js';

import { AuthService } from './domains/identity/application/auth.service.js';
import { SqliteRefreshTokenRepository, SqliteUserRepository } from './domains/identity/infrastructure/sqlite-user.repository.js';
import { BcryptHasher, JwtTokenIssuer } from './domains/identity/infrastructure/crypto.js';
import { authRouter, meRoute, usersRouter } from './domains/identity/presentation/auth.routes.js';
import { requireAuth } from './domains/identity/presentation/require-auth.js';
import { BoardsService } from './domains/boards/application/boards.service.js';
import { SqliteBoardRepository } from './domains/boards/infrastructure/sqlite-board.repository.js';
import { boardsRouter } from './domains/boards/presentation/boards.routes.js';
import { CardsService } from './domains/cards/application/cards.service.js';
import { SqliteCardRepository, SqliteColumnQuery } from './domains/cards/infrastructure/sqlite-card.repository.js';
import { cardsRouter } from './domains/cards/presentation/cards.routes.js';
import { InvitationsService } from './domains/invites/application/invitations.service.js';
import { SqliteInvitationRepository } from './domains/invites/infrastructure/sqlite-invitation.repository.js';
import { boardInvitationsRouter, invitationsRouter } from './domains/invites/presentation/invitations.routes.js';
import { MailService } from './domains/mail/application/mail.service.js';
import type { Mailer } from './domains/mail/application/ports.js';
import { ConsoleMailer, SendGridMailer, SqliteOutboxRepository } from './domains/mail/infrastructure/mailers.js';
import { registerMailSubscriptions } from './domains/mail/presentation/subscriptions.js';
import { MediaService } from './domains/media/application/media.service.js';
import { PicsumProvider, UnsplashImageSearch } from './domains/media/infrastructure/providers.js';
import { mediaRouter } from './domains/media/presentation/media.routes.js';

export interface AppDeps {
  db: Db;
  config: Config;
  clock?: Clock;
  mailer?: Mailer;
  bcryptRounds?: number;
}

/** Composition root: wires ports to adapters (manual DI) and mounts routers. */
export function createApp({ db, config, clock = systemClock, mailer, bcryptRounds }: AppDeps): Express {
  const bus = new EventBus();
  const uow = sqliteUnitOfWork(db);
  const isProd = config.NODE_ENV === 'production';

  const users = new SqliteUserRepository(db);
  const auth = new AuthService(
    users, new SqliteRefreshTokenRepository(db), new BcryptHasher(bcryptRounds ?? (config.NODE_ENV === 'test' ? 4 : 12)),
    new JwtTokenIssuer(config.JWT_SECRET), clock, bus,
  );
  const boards = new BoardsService(new SqliteBoardRepository(db), uow, clock, bus);
  const cards = new CardsService(new SqliteCardRepository(db), new SqliteColumnQuery(db), boards, uow, clock, bus);

  const mailAdapter = mailer
    ?? (config.SENDGRID_API_KEY ? new SendGridMailer(config.SENDGRID_API_KEY, config.MAIL_FROM) : new ConsoleMailer());
  const mail = new MailService(new SqliteOutboxRepository(db), mailAdapter, clock, config.CLIENT_URL);
  registerMailSubscriptions(bus, mail);

  const invites = new InvitationsService(
    new SqliteInvitationRepository(db), boards,
    {
      findByEmail: (email) => auth.findByEmail(email),
      emailOf: (id) => auth.emailOf(id),
      displayName: (id) => { const u = users.findById(id); return u ? u.fullName || u.username : ''; },
    },
    mail, uow, clock, bus,
  );

  const picsum = new PicsumProvider();
  const media = new MediaService(config.UNSPLASH_ACCESS_KEY ? new UnsplashImageSearch(config.UNSPLASH_ACCESS_KEY) : picsum, picsum);

  const app = express();
  app.disable('x-powered-by');
  if (isProd) app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: config.CLIENT_URL.split(',').map((s) => s.trim()), credentials: true }));
  app.use(express.json({ limit: '256kb' }));
  app.use(cookieParser());

  const authed = requireAuth(auth);
  app.get('/api/health', (_req, res) => { res.json({ ok: true }); });
  app.use('/api/auth', authRouter(auth, { secureCookie: isProd, rateLimit: config.NODE_ENV !== 'test' }));
  app.get('/api/auth/me', authed, meRoute(auth));
  app.use('/api/users', authed, usersRouter(auth));
  app.use('/api/boards', authed, boardsRouter(boards), cardsRouter(cards), boardInvitationsRouter(invites));
  app.use('/api/invitations', invitationsRouter(invites, authed));
  app.use('/api/media', authed, mediaRouter(media));
  app.use('/api', (_req, _res, next) => next(new DomainError('NOT_FOUND', 'Route not found')));
  app.use(errorHandler);
  return app;
}
