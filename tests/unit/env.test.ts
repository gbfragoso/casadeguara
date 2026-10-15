import { describe, expect, it } from 'vitest';

import { variables } from '../../src/env';

describe('environment variables', () => {
	it('accepts a configured database URL', () => {
		const databaseUrl = 'postgresql://localhost/test';

		const result = variables.POSTGRES_URL.schema['~standard'].validate(databaseUrl);

		expect(result).toEqual({ value: databaseUrl });
	});

	it.each([undefined, ''])('rejects a missing database URL (%o)', (databaseUrl) => {
		const result = variables.POSTGRES_URL.schema['~standard'].validate(databaseUrl);

		expect(result).toEqual({ issues: [{ message: 'POSTGRES_URL is not set' }] });
	});

	it('allows NODE_ENV to be unset', () => {
		const result = variables.NODE_ENV.schema['~standard'].validate(undefined);

		expect(result).toEqual({ value: undefined });
	});
});
