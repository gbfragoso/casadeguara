import { afterEach, describe, expect, it, vi } from 'vitest';

type DatabaseEnvironment = { NODE_ENV: string; POSTGRES_URL?: string };
type PostgresOptions = { onnotice: () => void; ssl?: string };
type PostgresFactory = (url: string, options: PostgresOptions) => object;
type DrizzleFactory = (client: object, options: object) => object;

const loadConnection = async (env: DatabaseEnvironment) => {
	vi.resetModules();
	const client = {};
	const database = {};
	const postgres = vi.fn<PostgresFactory>(() => client);
	const drizzle = vi.fn<DrizzleFactory>(() => database);
	vi.doMock('$env/dynamic/private', () => ({ env }));
	vi.doMock('postgres', () => ({ default: postgres }));
	vi.doMock('drizzle-orm/postgres-js', () => ({ drizzle }));

	const connection = await import('$lib/server/database/connection');

	return { client, connection, drizzle, postgres };
};

afterEach(() => {
	vi.doUnmock('$env/dynamic/private');
	vi.doUnmock('postgres');
	vi.doUnmock('drizzle-orm/postgres-js');
	vi.resetModules();
});

describe('database connection', () => {
	it.each([
		[{ NODE_ENV: 'test', POSTGRES_URL: 'postgresql://localhost/test' }, undefined],
		[{ NODE_ENV: 'production', POSTGRES_URL: 'postgresql://localhost/production' }, 'require'],
	])('configures the Postgres client for %o', async (env, ssl) => {
		const { client, connection, drizzle, postgres } = await loadConnection(env);
		const options = postgres.mock.calls[0]?.[1];

		expect(connection.db).toBe(drizzle.mock.results[0]?.value);
		expect(postgres).toHaveBeenCalledWith(env.POSTGRES_URL, expect.objectContaining({ ssl }));
		expect(options?.onnotice).toEqual(expect.any(Function));
		expect(options?.onnotice()).toBeUndefined();
		expect(drizzle).toHaveBeenCalledWith(client, expect.objectContaining({ schema: expect.any(Object) }));
	});

	it('rejects a missing database URL before creating a client', async () => {
		vi.doMock('$env/dynamic/private', () => ({ env: { NODE_ENV: 'test' } }));

		await expect(import('$lib/server/database/connection')).rejects.toThrow('POSTGRES_URL is not set');
	});
});
