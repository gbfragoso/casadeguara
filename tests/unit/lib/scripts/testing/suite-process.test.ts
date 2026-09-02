import { resolve } from 'node:path';

import { assertSuite, suiteCommand } from '../../../../../src/lib/scripts/testing/suite-process.js';
import { describe, expect, it } from 'vitest';

const vitest = resolve('node_modules/vitest/vitest.mjs');
const playwright = resolve('node_modules/@playwright/test/cli.js');

describe('suite process routing', () => {
	it.each([
		['integration', [process.execPath, [vitest, 'run', '--project', 'integration']]],
		['coverage', [process.execPath, [vitest, 'run', '--coverage']]],
		['performance', [process.execPath, [vitest, 'run', '--project', 'performance']]],
		['e2e', [process.execPath, [playwright, 'test']]],
	])('routes %s to its dedicated runner', (suite, expected) => {
		expect(suiteCommand(suite)).toEqual(expected);
	});

	it('accepts the performance suite without coverage arguments', () => {
		expect(() => assertSuite('performance', [])).not.toThrow();
	});
});
