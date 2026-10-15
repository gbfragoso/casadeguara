import { describe, expect, it } from 'vitest';

import { params } from '../../../src/params';

type MatcherName = keyof typeof params;

const matchParam = (matcher: MatcherName, value: string) => params[matcher]['~standard'].validate(value);

describe('route param matchers', () => {
	it.each([
		['alphanumeric', 'usuario01'],
		['integer', '42'],
		['uuid', '0f8fad5b-d9cb-469f-a165-70867728950e'],
	] as const)('accepts a valid %s param unchanged', (matcher, value) => {
		const result = matchParam(matcher, value);

		expect(result).toEqual({ value });
	});

	it.each([
		['alphanumeric', 'usuario-01'],
		['integer', '4a'],
		['uuid', 'not-a-uuid'],
	] as const)('rejects an invalid %s param', (matcher, value) => {
		const result = matchParam(matcher, value);

		expect(result).toHaveProperty('issues');
	});
});
