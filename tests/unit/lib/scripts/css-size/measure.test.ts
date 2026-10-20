import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { measureCss, runMeasure } from '../../../../../src/lib/scripts/css-size/measure.js';

const APP_STYLES_BYTES = 120;
const FONT_STYLES_BYTES = 80;
const TOTAL_CSS_BYTES = APP_STYLES_BYTES + FONT_STYLES_BYTES;

describe('measureCss', () => {
	let directory: string;

	beforeEach(async () => {
		directory = await mkdtemp(join(tmpdir(), 'css-size-'));
		await writeFile(join(directory, 'app.css'), 'a'.repeat(APP_STYLES_BYTES));
		await writeFile(join(directory, 'fonts.css'), 'b'.repeat(FONT_STYLES_BYTES));
		await writeFile(join(directory, 'entry.js'), 'c'.repeat(TOTAL_CSS_BYTES));
		await writeFile(join(directory, 'logo.svg'), 'd'.repeat(TOTAL_CSS_BYTES));
		await mkdir(join(directory, 'nested.css'));
	});

	afterEach(async () => {
		await rm(directory, { recursive: true, force: true });
	});

	it('sums only the stylesheets of the assets directory', async () => {
		const measurement = await measureCss(directory);

		expect(measurement).toEqual({ files: 2, totalBytes: TOTAL_CSS_BYTES });
	});

	it('prints the measurement and fails above the byte limit', async () => {
		const lines: string[] = [];

		const code = await runMeasure([`--max-bytes=${TOTAL_CSS_BYTES - 1}`], {
			directory,
			write: (line) => lines.push(line),
		});

		expect(code).toBe(1);
		expect(lines).toEqual([JSON.stringify({ files: 2, totalBytes: TOTAL_CSS_BYTES })]);
	});

	it('accepts a total equal to the byte limit', async () => {
		const code = await runMeasure([`--max-bytes=${TOTAL_CSS_BYTES}`], { directory, write: () => undefined });

		expect(code).toBe(0);
	});

	it('rejects a byte limit that is not a non-negative integer', async () => {
		const measurement = runMeasure(['--max-bytes=abc'], { directory, write: () => undefined });

		await expect(measurement).rejects.toThrow('--max-bytes must be a non-negative integer.');
	});
});
