import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { withMigrationDatabase } from './migration-test-support';

const migration = readFileSync(resolve('src/lib/server/database/0007_glamorous_wild_pack.sql'), 'utf8');

async function createLegacyTables(database: Parameters<Parameters<typeof withMigrationDatabase>[0]>[0]) {
	await database.unsafe('CREATE SEQUENCE "leitor_idleitor_seq" AS bigint START WITH 1');
	await database.unsafe(`CREATE TABLE "cadastros" (
		"idleitor" smallint PRIMARY KEY NOT NULL DEFAULT nextval('leitor_idleitor_seq'::regclass),
		"nome" text NOT NULL
	)`);
	await database.unsafe('ALTER SEQUENCE "leitor_idleitor_seq" OWNED BY "cadastros"."idleitor"');
	await database.unsafe(
		'CREATE TABLE "cadastro_fotos" ("cadastro_id" smallint PRIMARY KEY NOT NULL, "original" bytea NOT NULL, "cartao" bytea NOT NULL)',
	);
	await database.unsafe(
		'ALTER TABLE "cadastro_fotos" ADD CONSTRAINT "cadastro_fotos_cadastro_id_cadastros_idleitor_fk" FOREIGN KEY ("cadastro_id") REFERENCES "cadastros" ("idleitor") ON DELETE CASCADE',
	);
	await database.unsafe('CREATE TABLE "emprestimo" ("leitor" smallint NOT NULL)');
	await database.unsafe('INSERT INTO "cadastros" ("idleitor", "nome") VALUES (32767, \'limite\')');
	await database.unsafe("SELECT setval('leitor_idleitor_seq', 32767, true)");
	await database.unsafe("INSERT INTO \"cadastro_fotos\" VALUES (32767, decode('01', 'hex'), decode('02', 'hex'))");
	await database.unsafe('INSERT INTO "emprestimo" VALUES (32767)');
}

describe('cadastro identifier migration', () => {
	it('preserves limit data, relationships, sequence and cascade', async () => {
		await withMigrationDatabase(async (database) => {
			await createLegacyTables(database);
			await database.begin((transaction) => transaction.unsafe(migration));
			const types =
				await database.unsafe(`SELECT table_name, column_name, data_type FROM information_schema.columns
				WHERE (table_name, column_name) IN (('cadastros', 'idleitor'), ('cadastro_fotos', 'cadastro_id'), ('emprestimo', 'leitor'))
				ORDER BY table_name`);
			const [foreignKey] =
				await database.unsafe(`SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint
				WHERE conname = 'cadastro_fotos_cadastro_id_cadastros_idleitor_fk'`);
			const [defaultValue] = await database.unsafe(`SELECT column_default FROM information_schema.columns
				WHERE table_name = 'cadastros' AND column_name = 'idleitor'`);
			const [nextId] = await database.unsafe("SELECT nextval('leitor_idleitor_seq') AS id");
			expect(types.map((row) => row.data_type)).toEqual(['integer', 'integer', 'integer']);
			expect(foreignKey.definition).toContain('ON DELETE CASCADE');
			expect(defaultValue.column_default).toContain('leitor_idleitor_seq');
			expect(Number(nextId.id)).toBe(32768);
			await database.unsafe('DELETE FROM "cadastros" WHERE "idleitor" = 32767');
			const [photos] = await database.unsafe('SELECT count(*)::int AS count FROM "cadastro_fotos"');
			expect(photos.count).toBe(0);
		});
	});

	it('rolls back every DDL change when a later migration step fails', async () => {
		await withMigrationDatabase(async (database) => {
			await createLegacyTables(database);
			const failingMigration = `${migration}\nDO $$ BEGIN RAISE EXCEPTION 'forced migration rollback'; END $$;`;
			await expect(database.begin((transaction) => transaction.unsafe(failingMigration))).rejects.toThrow(
				'forced migration rollback',
			);
			const [column] = await database.unsafe(`SELECT data_type FROM information_schema.columns
				WHERE table_name = 'cadastros' AND column_name = 'idleitor'`);
			const [photo] = await database.unsafe('SELECT count(*)::int AS count FROM "cadastro_fotos"');
			expect(column.data_type).toBe('smallint');
			expect(photo.count).toBe(1);
		});
	});

	it('rejects an out-of-range sequence before changing column types', async () => {
		await withMigrationDatabase(async (database) => {
			await createLegacyTables(database);
			await database.unsafe('ALTER SEQUENCE "leitor_idleitor_seq" AS bigint');
			await database.unsafe("SELECT setval('leitor_idleitor_seq', 2147483648, true)");
			await expect(database.begin((transaction) => transaction.unsafe(migration))).rejects.toThrow(
				'cadastro identifier exceeds integer capacity',
			);
			const [column] = await database.unsafe(`SELECT data_type FROM information_schema.columns
				WHERE table_name = 'cadastros' AND column_name = 'idleitor'`);
			expect(column.data_type).toBe('smallint');
		});
	});
});
