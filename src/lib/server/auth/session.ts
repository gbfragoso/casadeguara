import { createHash, randomBytes } from 'node:crypto';

import { db } from '#lib/server/database/connection.js';
import { session, user } from '#lib/server/database/schema.js';
import { eq } from 'drizzle-orm';

const SESSION_DURATION_MS = 30 * 60 * 1000;
const SESSION_RENEWAL_WINDOW_MS = SESSION_DURATION_MS / 2;
const SESSION_TOKEN_BYTES = 20;

export type Session = { id: string; userId: string; expiresAt: Date; fresh: boolean };
export type SessionUser = { id: string; username: string; roles: string; name: string };
export type SessionValidation = { session: Session; user: SessionUser } | { session: null; user: null };

const INVALID_SESSION: SessionValidation = { session: null, user: null };

const sessionFields = { id: session.id, userId: session.userId, expiresAt: session.expiresAt };
const userFields = { id: user.id, username: user.username, roles: user.roles, name: user.name };

export const generateSessionToken = () => randomBytes(SESSION_TOKEN_BYTES).toString('base64url');

const hashSessionToken = (token: string) => createHash('sha256').update(token).digest('hex');

const calculateExpiration = (now: Date) => new Date(now.getTime() + SESSION_DURATION_MS);

const isWithinRenewalWindow = (expiresAt: Date, now: Date) =>
	expiresAt.getTime() - now.getTime() < SESSION_RENEWAL_WINDOW_MS;

export class SessionModel {
	constructor(private readonly database: typeof db = db) {}

	async create(token: string, userId: string, now = new Date()): Promise<Session> {
		const created = { id: hashSessionToken(token), userId, expiresAt: calculateExpiration(now) };
		await this.database.insert(session).values(created);

		return { ...created, fresh: true };
	}

	async validate(token: string, now = new Date()): Promise<SessionValidation> {
		const [found] = await this.database
			.select({ session: sessionFields, user: userFields })
			.from(session)
			.innerJoin(user, eq(session.userId, user.id))
			.where(eq(session.id, hashSessionToken(token)))
			.limit(1);

		if (!found) return INVALID_SESSION;
		if (found.session.expiresAt <= now) {
			await this.database.delete(session).where(eq(session.id, found.session.id));
			return INVALID_SESSION;
		}
		if (!isWithinRenewalWindow(found.session.expiresAt, now)) {
			return { session: { ...found.session, fresh: false }, user: found.user };
		}

		return { session: await this.renew(found.session.id, found.session.userId, now), user: found.user };
	}

	async invalidateUserSessions(userId: string) {
		await this.database.delete(session).where(eq(session.userId, userId));
	}

	private async renew(id: string, userId: string, now: Date): Promise<Session> {
		const expiresAt = calculateExpiration(now);
		await this.database.update(session).set({ expiresAt }).where(eq(session.id, id));

		return { id, userId, expiresAt, fresh: true };
	}
}

export const sessionModel = new SessionModel();
