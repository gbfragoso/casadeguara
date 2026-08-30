import { randomUUID } from 'node:crypto';

/** @typedef {{runId: string, databaseName: string, databaseUrl: string}} TestDatabaseContext */
/** @typedef {{runId?: string, databaseName?: string, databaseUrl?: string}} TestDatabaseContextInput */

export const TEST_DATABASE_PREFIX = 'casadeguara_test_';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** @param {string | undefined} rawUrl @returns {URL} */
export function parseLocalDatabaseUrl(rawUrl) {
	if (!rawUrl) throw new Error('POSTGRES_URL is required.');

	let url;
	try {
		url = new URL(rawUrl);
	} catch (error) {
		throw new Error('POSTGRES_URL must be a valid PostgreSQL URL.', { cause: error });
	}

	if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
		throw new Error('Test suites require a PostgreSQL URL.');
	}
	if (!LOCAL_HOSTS.has(url.hostname.toLowerCase())) {
		throw new Error('Test suites accept only localhost PostgreSQL servers.');
	}
	if (url.pathname.slice(1) !== 'local') {
		throw new Error('Test suites require the local database as their base.');
	}

	return url;
}

/** @param {string} baseUrl @returns {TestDatabaseContext} */
export function createTestDatabaseContext(baseUrl) {
	const base = parseLocalDatabaseUrl(baseUrl);
	const runId = randomUUID();
	const databaseName = `${TEST_DATABASE_PREFIX}${runId}`;
	const databaseUrl = new URL(base);
	databaseUrl.pathname = `/${databaseName}`;

	return { runId, databaseName, databaseUrl: databaseUrl.toString() };
}

/** @param {TestDatabaseContextInput | null | undefined} context @returns {URL} */
export function assertTestDatabaseContext(context) {
	if (!context?.runId || !UUID_PATTERN.test(context.runId)) {
		throw new Error('TEST_DATABASE_RUN_ID must be a UUID.');
	}
	const expectedName = `${TEST_DATABASE_PREFIX}${context.runId}`;
	if (context.databaseName !== expectedName) {
		throw new Error('TEST_DATABASE_NAME does not match TEST_DATABASE_RUN_ID.');
	}
	const databaseUrl = context.databaseUrl;
	if (!databaseUrl) throw new Error('POSTGRES_URL is required.');
	const url = new URL(databaseUrl);
	if (
		!['postgres:', 'postgresql:'].includes(url.protocol) ||
		!LOCAL_HOSTS.has(url.hostname.toLowerCase()) ||
		url.pathname.slice(1) !== expectedName
	) {
		throw new Error('POSTGRES_URL does not match the emitted test database.');
	}
	return url;
}

/** @param {string} rawUrl @param {string} databaseName @returns {string} */
export function withDatabaseName(rawUrl, databaseName) {
	const url = new URL(rawUrl);
	url.pathname = `/${databaseName}`;
	return url.toString();
}
