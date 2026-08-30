import 'dotenv/config';

import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createTestDatabase, dropTestDatabase, provisionTestDatabase } from './database.js';
import { assertSuite, runChild, signalExitCode } from './suite-process.js';

/** @typedef {{runId: string, databaseName: string, databaseUrl: string}} TestDatabaseContext */
/** @typedef {{ create?: (url: string) => Promise<TestDatabaseContext>, provision?: (context: TestDatabaseContext) => Promise<void>, drop?: (context: TestDatabaseContext) => Promise<void>, execute?: (suite: string, args: string[], environment: NodeJS.ProcessEnv, signalSource: NodeJS.Process) => Promise<{code: number}>, environment?: NodeJS.ProcessEnv, signalSource?: NodeJS.Process }} RunnerDependencies */

/** @param {string} suite @param {string[]} forwardedArgs @param {RunnerDependencies} [dependencies] @returns {Promise<number>} */
export async function runSuite(suite, forwardedArgs, dependencies = {}) {
	const args = [...forwardedArgs];
	assertSuite(suite, args);
	const create = dependencies.create ?? createTestDatabase;
	const provision = dependencies.provision ?? provisionTestDatabase;
	const drop = dependencies.drop ?? dropTestDatabase;
	const execute = dependencies.execute ?? runChild;
	const environment = dependencies.environment ?? process.env;
	const signalSource = dependencies.signalSource ?? process;
	let context;
	let result = 1;
	let interruptedCode;
	/** @param {NodeJS.Signals} signal */
	const recordSignal = (signal) => {
		interruptedCode = signalExitCode(signal);
	};
	signalSource.once('SIGINT', recordSignal);
	signalSource.once('SIGTERM', recordSignal);
	try {
		if (!environment.POSTGRES_URL) throw new Error('POSTGRES_URL is required.');
		context = await create(environment.POSTGRES_URL);
		const childEnvironment = {
			...environment,
			NODE_ENV: 'test',
			POSTGRES_URL: context.databaseUrl,
			TEST_DATABASE_NAME: context.databaseName,
			TEST_DATABASE_RUN_ID: context.runId,
		};
		await provision(context);
		if (interruptedCode) result = interruptedCode;
		else {
			const childResult = await execute(suite, args, childEnvironment, signalSource);
			result = interruptedCode ?? childResult.code;
		}
	} catch (error) {
		console.error(error);
	} finally {
		if (context) {
			try {
				await drop(context);
			} catch (error) {
				console.error('Test database cleanup failed.', error);
				if (result === 0) result = 1;
			}
		}
		signalSource.removeListener('SIGINT', recordSignal);
		signalSource.removeListener('SIGTERM', recordSignal);
	}
	return result;
}

async function main() {
	const [suite, ...args] = process.argv.slice(2);
	return runSuite(suite, args);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main().then(
		(code) => (process.exitCode = code),
		(error) => {
			console.error(error);
			process.exitCode = 2;
		},
	);
}
