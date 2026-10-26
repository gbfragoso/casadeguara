import { randomUUID } from 'node:crypto';

import { generateUserId } from '#lib/server/auth/user-id.js';
import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { inArray } from 'drizzle-orm';

const UNIQUE_SUFFIX_LENGTH = 12;

export const createTestUsername = () => `${randomUUID().slice(0, UNIQUE_SUFFIX_LENGTH)}@teste.com`;

export const createTestUserValues = (roles: string) => ({
	id: generateUserId(),
	username: createTestUsername(),
	name: `0teste-${randomUUID()}`,
	passwordHash: 'hash-de-teste',
	roles,
});

export async function withUsers<T>(rolesList: string[], callback: (ids: string[]) => Promise<T>) {
	const users = rolesList.map(createTestUserValues);
	await db.insert(user).values(users);
	const ids = users.map(({ id }) => id);

	try {
		return await callback(ids);
	} finally {
		await db.delete(user).where(inArray(user.id, ids));
	}
}
