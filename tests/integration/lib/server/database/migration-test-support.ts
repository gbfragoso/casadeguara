import { createTestDatabase, dropTestDatabase, provisionTestDatabase } from '$lib/scripts/testing/database.js';
import { withDatabaseName } from '$lib/scripts/testing/database-url.js';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '$lib/server/database/schema';
import { getTestDatabaseUrl } from '../../../../support/database';
import postgres from 'postgres';

type Database = ReturnType<typeof postgres>;
type ProvisionedDatabase = PostgresJsDatabase<typeof schema> & { $client: ReturnType<typeof postgres> };

export async function withMigrationDatabase<Result>(
	callback: (database: Database) => Promise<Result>,
): Promise<Result> {
	const context = await createTestDatabase(withDatabaseName(getTestDatabaseUrl(), 'local'));
	const database = postgres(context.databaseUrl, { max: 1 });
	try {
		return await callback(database);
	} finally {
		await database.end();
		await dropTestDatabase(context);
	}
}

export async function withProvisionedDatabase<Result>(callback: (database: ProvisionedDatabase) => Promise<Result>) {
	const context = await createTestDatabase(withDatabaseName(getTestDatabaseUrl(), 'local'));
	try {
		await provisionTestDatabase(context);
		const client = postgres(context.databaseUrl, { max: 1 });
		try {
			return await callback(drizzle(client, { schema }));
		} finally {
			await client.end();
		}
	} finally {
		await dropTestDatabase(context);
	}
}
