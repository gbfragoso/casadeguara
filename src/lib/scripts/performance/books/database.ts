import { assertTestDatabaseContext } from '$lib/scripts/testing/database-url.js';
import * as schema from '$lib/server/database/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

function getDatabaseUrl(environment: NodeJS.ProcessEnv) {
	const url = assertTestDatabaseContext({
		runId: environment.TEST_DATABASE_RUN_ID,
		databaseName: environment.TEST_DATABASE_NAME,
		databaseUrl: environment.POSTGRES_URL,
	});
	return url.toString();
}

export function connectPerformanceDatabase(environment: NodeJS.ProcessEnv = process.env) {
	const client = postgres(getDatabaseUrl(environment), { max: 1 });
	return { client, database: drizzle(client, { schema }) };
}
