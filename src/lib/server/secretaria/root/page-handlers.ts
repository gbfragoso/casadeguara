import type { RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { cadastros } from '#lib/server/database/schema.js';
import { requireAuthenticatedUser } from '#lib/server/authorization/authenticated-user.js';
import { count, eq } from 'drizzle-orm';

const countWorkers = async () => db.select({ counter: count() }).from(cadastros).where(eq(cadastros.trab, true));

const load = ({ locals }: RequestEvent) => {
	requireAuthenticatedUser(locals.user);

	return { leitores: countWorkers() };
};

export const createSecretariaHandlers = () => ({
	load,
});
