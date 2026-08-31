import { describe, expect, it, vi } from 'vitest';
import { runSuite } from '../../../../../src/lib/scripts/testing/run-suite.js';

const context = {
	runId: '123e4567-e89b-12d3-a456-426614174000',
	databaseName: 'casadeguara_test_123e4567-e89b-12d3-a456-426614174000',
	databaseUrl: 'postgresql://root:secret@localhost:5432/casadeguara_test_123e4567-e89b-12d3-a456-426614174000',
};

function dependencies(code = 0) {
	return {
		environment: { NODE_ENV: 'test', POSTGRES_URL: 'postgresql://root:secret@localhost:5432/local' },
		create: vi.fn(async () => context),
		provision: vi.fn(async () => undefined),
		execute: vi.fn(async () => ({ code })),
		drop: vi.fn(async () => undefined),
	};
}

describe('runSuite', () => {
	it('rejects suites outside the explicit allowlist', async () => {
		await expect(runSuite('unit', [])).rejects.toThrow('Unknown test suite');
	});

	it('requires a narrow include when coverage is requested', async () => {
		await expect(runSuite('coverage', [])).rejects.toThrow('--coverage.include');
	});

	it('cleans the exact target after a successful suite', async () => {
		const deps = dependencies();

		const result = await runSuite('integration', ['tests/example.test.ts'], deps);

		expect(result).toBe(0);
		expect(deps.provision).toHaveBeenCalledWith(context);
		expect(deps.execute).toHaveBeenCalledWith(
			'integration',
			['tests/example.test.ts'],
			expect.objectContaining({
				POSTGRES_URL: context.databaseUrl,
				TEST_DATABASE_NAME: context.databaseName,
			}),
			expect.anything(),
		);
		expect(deps.drop).toHaveBeenCalledWith(context);
	});

	it('preserves the suite exit code when the suite fails', async () => {
		const deps = dependencies(7);

		const result = await runSuite('integration', [], deps);

		expect(result).toBe(7);
		expect(deps.drop).toHaveBeenCalledTimes(1);
	});

	it('preserves the interruption exit code and still cleans up', async () => {
		const deps = dependencies(130);

		const result = await runSuite('integration', [], deps);

		expect(result).toBe(130);
		expect(deps.drop).toHaveBeenCalledWith(context);
	});

	it('cleans up after provisioning fails before starting the suite', async () => {
		const deps = dependencies();
		deps.provision.mockRejectedValue(new Error('push failed'));

		const result = await runSuite('integration', [], deps);

		expect(result).toBe(1);
		expect(deps.execute).not.toHaveBeenCalled();
		expect(deps.drop).toHaveBeenCalledWith(context);
	});
});
