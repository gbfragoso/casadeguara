import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import postgres from 'postgres';
import { describe, expect, it } from 'vitest';

import { withMigrationDatabase } from './migration-test-support';

const migration = readFileSync(resolve('src/lib/server/database/0006_fat_zodiak.sql'), 'utf8').replaceAll(
	'--> statement-breakpoint',
	'',
);

async function createLegacyTables(database: ReturnType<typeof postgres>) {
	await database.unsafe('CREATE TABLE "cadastros" ("idleitor" smallserial PRIMARY KEY, "foto" bytea)');
	await database.unsafe(`INSERT INTO "cadastros" ("foto") VALUES (decode('010203', 'hex'))`);
	await database.unsafe('INSERT INTO "cadastros" DEFAULT VALUES');
}

describe('cadastro_fotos migration', () => {
	it('copies source bytes to both derivatives and removes the legacy column after reconciliation', async () => {
		await withMigrationDatabase(async (database) => {
			await createLegacyTables(database);
			await database.begin((transaction) => transaction.unsafe(migration));
			const [row] = await database.unsafe('SELECT "original", "cartao" FROM "cadastro_fotos"');
			const [legacy] = await database.unsafe(
				`SELECT count(*)::int AS count FROM information_schema.columns WHERE table_name = 'cadastros' AND column_name = 'foto'`,
			);
			expect(Array.from(row.original as Uint8Array)).toEqual([1, 2, 3]);
			expect(Array.from(row.cartao as Uint8Array)).toEqual([1, 2, 3]);
			expect(legacy.count).toBe(0);
		});
	});

	it('rolls back table creation and column removal when reconciliation fails', async () => {
		await withMigrationDatabase(async (database) => {
			await createLegacyTables(database);
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
