import { assertTestDatabaseContext } from '$lib/scripts/testing/database-url.js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '$lib/server/database/schema';

function getDatabaseUrl(environment: NodeJS.ProcessEnv) {
	return assertTestDatabaseContext({
		runId: environment.TEST_DATABASE_RUN_ID,
		databaseName: environment.TEST_DATABASE_NAME,
		databaseUrl: environment.POSTGRES_URL,
	}).toString();
}

export function connectTreasuryPerformanceDatabase(environment: NodeJS.ProcessEnv = process.env) {
	const client = postgres(getDatabaseUrl(environment), { max: 1 });
	return { client, database: drizzle(client, { schema }) };
}
