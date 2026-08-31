import postgres from 'postgres';
import { describe, expect, it } from 'vitest';
import {
	createTestDatabase,
	dropTestDatabase,
	provisionTestDatabase,
} from '../../../../../src/lib/scripts/testing/database.js';

function localDatabaseUrl() {
	const url = new URL(process.env.POSTGRES_URL ?? '');
	url.pathname = '/local';
	return url.toString();
}

async function databaseExists(name: string) {
	const sql = postgres(localDatabaseUrl());
	try {
		const [row] = await sql<
			{ exists: boolean }[]
		>`SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = ${name}) AS exists`;
		return row?.exists ?? false;
	} finally {
		await sql.end();
	}
}

async function localFingerprint() {
	const sql = postgres(localDatabaseUrl());
	try {
		const [row] = await sql<{ tables: number; sequences: number }[]>`
			SELECT
				(SELECT count(*)::int FROM pg_class WHERE relkind = 'r') AS tables,
				(SELECT count(*)::int FROM pg_class WHERE relkind = 'S') AS sequences
		`;
		return row;
	} finally {
		await sql.end();
	}
}

describe('disposable test database lifecycle', () => {
	it('provisions a complete schema and removes it after the callback', async () => {
		const context = await createTestDatabase(localDatabaseUrl());
		try {
			await provisionTestDatabase(context);
			const sql = postgres(context.databaseUrl);
			try {
				const [extension] = await sql<
					{ installed: boolean }[]
				>`SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'unaccent') AS installed`;
				const [table] = await sql<
					{ present: boolean }[]
				>`SELECT to_regclass('public.cadastros') IS NOT NULL AS present`;
				expect(extension?.installed).toBe(true);
				expect(table?.present).toBe(true);
			} finally {
				await sql.end();
			}
		} finally {
			await dropTestDatabase(context);
		}

		expect(await databaseExists(context.databaseName)).toBe(false);
	});

	it('keeps the local database fingerprint unchanged across isolated executions', async () => {
		const before = await localFingerprint();
		const contexts = [await createTestDatabase(localDatabaseUrl()), await createTestDatabase(localDatabaseUrl())];
		try {
			await Promise.all(contexts.map(provisionTestDatabase));
		} finally {
			await Promise.all(contexts.map(dropTestDatabase));
		}

		expect(await localFingerprint()).toEqual(before);
	});
});
