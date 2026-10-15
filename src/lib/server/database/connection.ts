import { NODE_ENV, POSTGRES_URL } from '$app/env/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(POSTGRES_URL, {
	ssl: NODE_ENV === 'production' ? 'require' : undefined,
	onnotice: () => {},
});

export const db = drizzle(client, { schema });
