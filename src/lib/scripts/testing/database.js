import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import postgres from 'postgres';
import {
	assertTestDatabaseContext,
	createTestDatabaseContext,
	parseLocalDatabaseUrl,
	withDatabaseName,
} from './database-url.js';

const DRIZZLE_KIT = resolve('node_modules/drizzle-kit/bin.cjs');

/** @param {string} value */
function quoteIdentifier(value) {
	return `"${value.replaceAll('"', '""')}"`;
}

/** @param {string} value */
function quoteLiteral(value) {
	return `'${value.replaceAll("'", "''")}'`;
}

/** @param {string} command @param {string[]} args @param {NodeJS.ProcessEnv} environment @returns {Promise<void>} */
function runCommand(command, args, environment) {
	return new Promise((resolveProcess, rejectProcess) => {
		const child = spawn(command, args, { env: environment, stdio: 'inherit', shell: false });
		child.once('error', rejectProcess);
		child.once('close', (code) =>
			code === 0 ? resolveProcess() : rejectProcess(new Error(`${command} exited with ${code}`)),
		);
	});
}

/** @param {string} baseUrl @returns {Promise<import('./database-url.js').TestDatabaseContext>} */
export async function createTestDatabase(baseUrl) {
	const context = createTestDatabaseContext(baseUrl);
	const adminUrl = withDatabaseName(context.databaseUrl, 'local');
	const client = postgres(adminUrl, { max: 1 });
	try {
		await client.unsafe(`CREATE DATABASE ${quoteIdentifier(context.databaseName)}`);
		return context;
	} finally {
		await client.end();
	}
}

/** @param {import('./database-url.js').TestDatabaseContext} context @returns {Promise<void>} */
export async function provisionTestDatabase(context) {
	assertTestDatabaseContext(context);
	const client = postgres(context.databaseUrl, { max: 1 });
	try {
		await client.unsafe('CREATE EXTENSION IF NOT EXISTS unaccent');
	} finally {
		await client.end();
	}
	await runCommand(process.execPath, [DRIZZLE_KIT, 'push', '--force'], {
		...process.env,
		NODE_ENV: 'test',
		POSTGRES_URL: context.databaseUrl,
		TEST_DATABASE_NAME: context.databaseName,
		TEST_DATABASE_RUN_ID: context.runId,
	});
}

/** @param {import('./database-url.js').TestDatabaseContext} context @returns {Promise<void>} */
export async function dropTestDatabase(context) {
	const targetUrl = assertTestDatabaseContext(context);
	const adminUrl = withDatabaseName(targetUrl.toString(), 'local');
	const client = postgres(adminUrl, { max: 1 });
	try {
		const name = quoteIdentifier(context.databaseName);
		await client.unsafe(
			`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ${quoteLiteral(context.databaseName)} AND pid <> pg_backend_pid()`,
		);
		await client.unsafe(`DROP DATABASE IF EXISTS ${name}`);
	} finally {
		await client.end();
	}
}

export { parseLocalDatabaseUrl };
