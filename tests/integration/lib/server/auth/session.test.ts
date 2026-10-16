import { randomUUID } from 'node:crypto';

import { generateSessionToken, SessionModel } from '#lib/server/auth/session.js';
import { db } from '#lib/server/database/connection.js';
import { session, user } from '#lib/server/database/schema.js';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const model = new SessionModel(db);
const MINUTE_MS = 60 * 1000;
const SESSION_DURATION_MS = 30 * MINUTE_MS;
const createdAt = new Date('2026-10-15T12:00:00.000Z');
const minutesAfterCreation = (minutes: number) => new Date(createdAt.getTime() + minutes * MINUTE_MS);

let sessionUser: { id: string; username: string; roles: string; name: string };

beforeEach(async () => {
	const suffix = randomUUID().slice(0, 8);
	sessionUser = { id: `session-${suffix}`, username: `session-${suffix}`, roles: 'biblioteca', name: 'Sessão' };
	await db.insert(user).values({ ...sessionUser, passwordHash: 'not-used' });
});

afterEach(async () => {
	await db.delete(session).where(eq(session.userId, sessionUser.id));
	await db.delete(user).where(eq(user.id, sessionUser.id));
});

describe('SessionModel', () => {
	it('validates a new session and exposes its user', async () => {
		const token = generateSessionToken();
		const created = await model.create(token, sessionUser.id, createdAt);

		const validation = await model.validate(token, minutesAfterCreation(1));

		expect(validation).toEqual({ session: { ...created, fresh: false }, user: sessionUser });
	});

	it('stores only a hash of the session token', async () => {
		const token = generateSessionToken();

		const created = await model.create(token, sessionUser.id, createdAt);

		expect(created.id).not.toBe(token);
		expect(created.id).toMatch(/^[0-9a-f]{64}$/);
	});

	it('rejects an unknown token', async () => {
		const validation = await model.validate(generateSessionToken(), createdAt);

		expect(validation).toEqual({ session: null, user: null });
	});

	it('renews a session used during the second half of its lifetime', async () => {
		const token = generateSessionToken();
		await model.create(token, sessionUser.id, createdAt);
		const usedAt = minutesAfterCreation(20);

		const validation = await model.validate(token, usedAt);

		expect(validation.session).toMatchObject({
			fresh: true,
			expiresAt: new Date(usedAt.getTime() + SESSION_DURATION_MS),
		});
	});

	it('deletes an expired session', async () => {
		const token = generateSessionToken();
		const created = await model.create(token, sessionUser.id, createdAt);

		const validation = await model.validate(token, minutesAfterCreation(30));

		expect(validation).toEqual({ session: null, user: null });
		expect(await db.select().from(session).where(eq(session.id, created.id))).toEqual([]);
	});

	it('invalidates every session of a user', async () => {
		const firstToken = generateSessionToken();
		const secondToken = generateSessionToken();
		await model.create(firstToken, sessionUser.id, createdAt);
		await model.create(secondToken, sessionUser.id, createdAt);

		await model.invalidateUserSessions(sessionUser.id);

		expect(await model.validate(firstToken, minutesAfterCreation(1))).toEqual({ session: null, user: null });
		expect(await model.validate(secondToken, minutesAfterCreation(1))).toEqual({ session: null, user: null });
	});
});
