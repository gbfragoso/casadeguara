import { assertTestDatabaseContext } from '../../src/lib/scripts/testing/database-url.js';

export type TestDatabaseEnvironment = {
	NODE_ENV?: string;
	POSTGRES_URL?: string;
	TEST_DATABASE_NAME?: string;
	TEST_DATABASE_RUN_ID?: string;
};

export function assertTestDatabase(env: TestDatabaseEnvironment = process.env): void {
	if (env.NODE_ENV === 'production') throw new Error('Automated tests cannot run against production.');
	if (env.NODE_ENV !== 'test') throw new Error('Automated tests require NODE_ENV=test.');
	try {
		assertTestDatabaseContext({
			runId: env.TEST_DATABASE_RUN_ID,
			databaseName: env.TEST_DATABASE_NAME,
			databaseUrl: env.POSTGRES_URL,
		});
	} catch (error) {
		throw new Error(
			`Invalid disposable test database target: ${error instanceof Error ? error.message : String(error)}`,
			{
				cause: error,
			},
		);
	}
}

export function getTestDatabaseUrl(env: TestDatabaseEnvironment = process.env): string {
	assertTestDatabase(env);
	if (!env.POSTGRES_URL) throw new Error('POSTGRES_URL is required.');
	return env.POSTGRES_URL;
}
