import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const SUITES = new Set(['integration', 'coverage', 'e2e', 'performance']);
const SIGNAL_EXIT_CODES = { SIGINT: 130, SIGTERM: 143 };

/** @param {string} suite @returns {[string, string[]]} */
export function suiteCommand(suite) {
	const executable = process.execPath;
	const vitest = resolve('node_modules/vitest/vitest.mjs');
	const playwright = resolve('node_modules/@playwright/test/cli.js');
	if (suite === 'integration') return [executable, [vitest, 'run', '--project', 'integration']];
	if (suite === 'coverage') return [executable, [vitest, 'run', '--coverage']];
	if (suite === 'performance') return [executable, [vitest, 'run', '--project', 'performance']];
	return [executable, [playwright, 'test']];
}

/** @param {string} suite @param {string[]} args */
export function assertSuite(suite, args) {
	if (!SUITES.has(suite)) throw new Error(`Unknown test suite: ${suite}`);
	if (
		suite === 'coverage' &&
		!args.some((arg) => arg === '--coverage.include' || arg.startsWith('--coverage.include='))
	) {
		throw new Error('Coverage requires at least one narrow --coverage.include argument.');
	}
}

/** @param {NodeJS.Signals | null} signal */
export function signalExitCode(signal) {
	return signal === 'SIGINT' ? SIGNAL_EXIT_CODES.SIGINT : signal === 'SIGTERM' ? SIGNAL_EXIT_CODES.SIGTERM : 1;
}

/** @param {import('node:child_process').ChildProcess} child @returns {Promise<{code: number, signal: NodeJS.Signals | null}>} */
function waitForChild(child) {
	return new Promise((resolveChild, rejectChild) => {
		child.once('error', rejectChild);
		child.once('close', (code, signal) => resolveChild({ code: code ?? signalExitCode(signal), signal }));
	});
}

/** @param {string} suite @param {string[]} args @param {NodeJS.ProcessEnv} environment @param {NodeJS.Process} signalSource @returns {Promise<{code: number, signal: NodeJS.Signals | null}>} */
export async function runChild(suite, args, environment, signalSource = process) {
	const [command, commandArgs] = suiteCommand(suite);
	const child = spawn(command, [...commandArgs, ...args], { env: environment, stdio: 'inherit', shell: false });
	/** @param {NodeJS.Signals} signal */
	const forwardSignal = (signal) => child.kill(signal);
	signalSource.once('SIGINT', forwardSignal);
	signalSource.once('SIGTERM', forwardSignal);
	return waitForChild(child).finally(() => {
		signalSource.removeListener('SIGINT', forwardSignal);
		signalSource.removeListener('SIGTERM', forwardSignal);
	});
}
