import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { env } from '$env/dynamic/private';
import postgres from 'postgres';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(resolve('src/lib/server/database/0006_fat_zodiak.sql'), 'utf8').replaceAll(
	'--> statement-breakpoint',
	'',
);

const withMigrationDatabase = async <Result>(callback: (database: ReturnType<typeof postgres>) => Promise<Result>) => {
	if (!env.POSTGRES_URL) throw new Error('POSTGRES_URL is not set');
	const baseUrl = new URL(env.POSTGRES_URL);
	const databaseName = `photo_migration_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
	const adminUrl = new URL(baseUrl);
	adminUrl.pathname = '/postgres';
	const admin = postgres(adminUrl.toString());
	await admin.unsafe(`CREATE DATABASE "${databaseName}"`);
	await admin.end();

	const databaseUrl = new URL(baseUrl);
	databaseUrl.pathname = `/${databaseName}`;
	const database = postgres(databaseUrl.toString());
	try {
		await database.unsafe('CREATE TABLE "cadastros" ("idleitor" smallserial PRIMARY KEY, "foto" bytea)');
		await database.unsafe(`INSERT INTO "cadastros" ("foto") VALUES (decode('010203', 'hex'))`);
		await database.unsafe('INSERT INTO "cadastros" DEFAULT VALUES');
		return await callback(database);
	} finally {
		await database.end();
		const cleanup = postgres(adminUrl.toString());
		await cleanup.unsafe(`DROP DATABASE "${databaseName}"`);
		await cleanup.end();
	}
};

describe('cadastro_fotos migration', () => {
	it('copies source bytes to both derivatives and removes the legacy column after reconciliation', async () => {
		await withMigrationDatabase(async (database) => {
			await database.begin((transaction) => transaction.unsafe(migration));
			const [row] = await database.unsafe('SELECT "original", "cartao" FROM "cadastro_fotos"');
			const [legacy] = await database.unsafe(
				`SELECT count(*)::int AS count FROM information_schema.columns WHERE table_name = 'cadastros' AND column_name = 'foto'`,
			);
			const [constraints] = await database.unsafe(
				`SELECT count(*)::int AS count FROM pg_constraint WHERE conrelid = 'cadastro_fotos'::regclass AND contype IN ('p', 'f')`,
			);
			const [destination] = await database.unsafe('SELECT count(*)::int AS count FROM "cadastro_fotos"');

			expect(Array.from(row.original as Uint8Array)).toEqual([1, 2, 3]);
			expect(Array.from(row.cartao as Uint8Array)).toEqual([1, 2, 3]);
			expect(legacy.count).toBe(0);
			expect(destination.count).toBe(1);
			expect(constraints.count).toBe(2);
		});
	});

	it('rolls back table creation and column removal when reconciliation fails', async () => {
		await withMigrationDatabase(async (database) => {
			const failingMigration = migration.replace('<> (SELECT count(*) FROM "cadastro_fotos")', '<> 0');

			await expect(database.begin((transaction) => transaction.unsafe(failingMigration))).rejects.toThrow(
				'photo migration reconciliation failed',
			);
			const [legacy] = await database.unsafe(
				`SELECT count(*)::int AS count FROM information_schema.columns WHERE table_name = 'cadastros' AND column_name = 'foto'`,
			);
			const [destination] = await database.unsafe(
				`SELECT count(*)::int AS count FROM information_schema.tables WHERE table_name = 'cadastro_fotos'`,
			);

			expect(legacy.count).toBe(1);
			expect(destination.count).toBe(0);
		});
	});
});
