import { createTestDatabase, dropTestDatabase, provisionTestDatabase } from '#lib/scripts/testing/database.js';
import { assertTestDatabaseContext, withDatabaseName } from '#lib/scripts/testing/database-url.js';
import * as schema from '#lib/server/database/schema.js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connect = (client: ReturnType<typeof postgres>) => ({ client, database: drizzle(client, { schema }) });

type PerformanceConnection = ReturnType<typeof connect>;

function getBaseDatabaseUrl(environment: NodeJS.ProcessEnv) {
	const url = assertTestDatabaseContext({
		runId: environment.TEST_DATABASE_RUN_ID,
		databaseName: environment.TEST_DATABASE_NAME,
		databaseUrl: environment.POSTGRES_URL,
	});
	return withDatabaseName(url.toString(), 'local');
}

export async function withPerformanceDatabase<Result>(
	callback: (connection: PerformanceConnection) => Promise<Result>,
	environment: NodeJS.ProcessEnv = process.env,
): Promise<Result> {
	const context = await createTestDatabase(getBaseDatabaseUrl(environment));
	try {
		await provisionTestDatabase(context);
		const client = postgres(context.databaseUrl, { max: 1 });
		try {
			return await callback(connect(client));
		} finally {
			await client.end();
		}
	} finally {
		await dropTestDatabase(context);
	}
}
