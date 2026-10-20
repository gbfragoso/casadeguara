import { readdir, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const BUILD_ASSETS_DIRECTORY = '.svelte-kit/output/client/_app/immutable/assets';
const MAX_BYTES_OPTION = '--max-bytes=';
const LIMIT_EXCEEDED_EXIT_CODE = 1;
const FAILURE_EXIT_CODE = 2;

/** @param {string} directory @returns {Promise<{files: number, totalBytes: number}>} */
export async function measureCss(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const stylesheets = entries.filter((entry) => entry.isFile() && extname(entry.name) === '.css');
	const sizes = await Promise.all(stylesheets.map(async (entry) => (await stat(join(directory, entry.name))).size));

	return { files: stylesheets.length, totalBytes: sizes.reduce((total, size) => total + size, 0) };
}

/** @param {string[]} args @returns {number | undefined} */
export function parseMaxBytes(args) {
	const option = args.find((arg) => arg.startsWith(MAX_BYTES_OPTION));
	if (option === undefined) return undefined;

	const maxBytes = Number(option.slice(MAX_BYTES_OPTION.length));
	if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
		throw new Error('--max-bytes must be a non-negative integer.');
	}
	return maxBytes;
}

/** @param {string[]} args @param {{directory?: string, write?: (line: string) => void}} [dependencies] @returns {Promise<number>} */
export async function runMeasure(args, dependencies = {}) {
	const maxBytes = parseMaxBytes(args);
	const write = dependencies.write ?? console.log;
	const measurement = await measureCss(dependencies.directory ?? BUILD_ASSETS_DIRECTORY);

	write(JSON.stringify(measurement));
	return maxBytes !== undefined && measurement.totalBytes > maxBytes ? LIMIT_EXCEEDED_EXIT_CODE : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	runMeasure(process.argv.slice(2)).then(
		(code) => (process.exitCode = code),
		(error) => {
			console.error(error);
			process.exitCode = FAILURE_EXIT_CODE;
		},
	);
}
