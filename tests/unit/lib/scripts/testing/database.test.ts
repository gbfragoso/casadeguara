import { describe, expect, it } from 'vitest';
import { assertTestDatabase } from '../../../../../tests/support/database';
import {
	assertTestDatabaseContext,
	createTestDatabaseContext,
	parseLocalDatabaseUrl,
} from '../../../../../src/lib/scripts/testing/database-url.js';

const runId = '123e4567-e89b-12d3-a456-426614174000';
const validEnvironment = {
	NODE_ENV: 'test',
	POSTGRES_URL: `postgresql://root:secret@localhost:5432/casadeguara_test_${runId}`,
	TEST_DATABASE_NAME: `casadeguara_test_${runId}`,
	TEST_DATABASE_RUN_ID: runId,
};

describe('test database target', () => {
	it('accepts the disposable target emitted for an execution', () => {
		const context = createTestDatabaseContext('postgresql://root:secret@localhost:5432/local');

		assertTestDatabaseContext(context);

		expect(context.databaseName).toMatch(/^casadeguara_test_[0-9a-f-]{36}$/);
	});

	it('accepts a matching disposable environment before persistence imports', () => {
		expect(() => assertTestDatabase(validEnvironment)).not.toThrow();
	});

	it.each([
		['postgresql://root:secret@localhost:5432/local', 'wrong_name'],
		['postgresql://root:secret@localhost:5432/local', `casadeguara_test_${runId}`],
	])('rejects an emitted name that does not match the context', (url, databaseName) => {
		const context = { runId, databaseName, databaseUrl: url };

		expect(() => assertTestDatabaseContext(context)).toThrow();
	});

	it.each(['postgresql://root:secret@remote.example:5432/local', 'postgresql://root:secret@localhost:5432/postgres'])(
		'rejects a persistent or remote base URL: %s',
		(url) => {
			expect(() => parseLocalDatabaseUrl(url)).toThrow();
		},
	);

	it.each([
		{ ...validEnvironment, NODE_ENV: 'production' },
		{ ...validEnvironment, POSTGRES_URL: `postgresql://root:secret@remote.example:5432/casadeguara_test_${runId}` },
		{ ...validEnvironment, TEST_DATABASE_NAME: 'casadeguara_test_other' },
	])('rejects an unsafe environment before persistence imports: %o', (environment) => {
		expect(() => assertTestDatabase(environment)).toThrow();
	});
});
