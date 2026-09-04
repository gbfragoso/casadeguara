import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import postgres from 'postgres';
import { describe, expect, it } from 'vitest';

import { withMigrationDatabase } from './migration-test-support';

const migration = readFileSync(resolve('src/lib/server/database/0008_tiresome_klaw.sql'), 'utf8');
type MigrationDatabase = ReturnType<typeof postgres>;

type EntryValues = {
	id: number;
	description?: string;
	value?: string;
	date?: string;
	counterpartId?: number;
	depositado?: boolean | null;
	uuid?: string;
	userCadastro?: string | null;
	userAlteracao?: string | null;
	motivo?: string | null;
	userEstorno?: string | null;
	dataEstorno?: string | null;
};

async function createLegacyTables(database: MigrationDatabase) {
	await database.unsafe('CREATE TABLE "cadastros" ("idleitor" integer PRIMARY KEY, "nome" varchar(60) NOT NULL)');
	await database.unsafe(`CREATE TABLE "entradas" (
		"identrada" integer PRIMARY KEY, "descricao" varchar(200) NOT NULL, "valor" numeric NOT NULL,
		"data_entrada" date NOT NULL, "idcontribuinte" integer NOT NULL, "user_cadastro" varchar(30),
		"user_alteracao" varchar(30), "motivo_estorno" varchar(200), "user_estorno" varchar(30),
		"data_estorno" date, "uuid" varchar(36) NOT NULL, "data_registro" date NOT NULL,
		"depositado" boolean
	)`);
	await database.unsafe(`CREATE TABLE "saidas" (
		"idsaida" integer PRIMARY KEY, "descricao" varchar(200) NOT NULL, "valor" numeric NOT NULL,
		"data_saida" date NOT NULL, "user_cadastro" varchar(30), "user_alteracao" varchar(30)
	)`);
}

const insertCadastro = (database: MigrationDatabase, id: number) =>
	database`INSERT INTO cadastros (idleitor, nome) VALUES (${id}, ${`Cadastro ${id}`})`;

const insertEntry = (database: MigrationDatabase, values: EntryValues) =>
	database`INSERT INTO entradas (
		identrada, descricao, valor, data_entrada, idcontribuinte, user_cadastro, user_alteracao,
		motivo_estorno, user_estorno, data_estorno, uuid, data_registro, depositado
	) VALUES (
		${values.id}, ${values.description ?? 'Entrada'}, ${values.value ?? '10.00'}, ${values.date ?? '2026-09-01'},
		${values.counterpartId ?? 1}, ${values.userCadastro === undefined ? 'legacy.user' : values.userCadastro},
		${values.userAlteracao ?? null}, ${values.motivo ?? null}, ${values.userEstorno ?? null},
		${values.dataEstorno ?? null}, ${values.uuid ?? `00000000-0000-4000-8000-${values.id.toString().padStart(12, '0')}`},
		${'2026-09-02'}, ${values.depositado === undefined ? false : values.depositado}
	)`;

const insertOutput = (database: MigrationDatabase, id: number, value = '20.00') =>
	database`INSERT INTO saidas (idsaida, descricao, valor, data_saida, user_cadastro, user_alteracao)
	VALUES (${id}, ${`Saída ${id}`}, ${value}, ${'2026-09-03'}, ${'legacy.output'}, ${null})`;

const applyMigration = (database: MigrationDatabase, sql = migration) =>
	database.begin((transaction) => transaction.unsafe(sql));

async function assertRollback(database: MigrationDatabase) {
	const [legacy] = await database.unsafe<{ entries: number; outputs: number }[]>(
		`SELECT
			(SELECT count(*)::int FROM information_schema.tables WHERE table_name = 'entradas') AS entries,
			(SELECT count(*)::int FROM information_schema.tables WHERE table_name = 'saidas') AS outputs`,
	);
	const [destination] = await database.unsafe<{ entries: number; reversals: number }[]>(
		`SELECT
			(SELECT count(*)::int FROM information_schema.tables WHERE table_name = 'lancamentos') AS entries,
			(SELECT count(*)::int FROM information_schema.tables WHERE table_name = 'estornos') AS reversals`,
	);
	expect(legacy).toEqual({ entries: 1, outputs: 1 });
	expect(destination).toEqual({ entries: 0, reversals: 0 });
}

const setupValidSource = async (database: MigrationDatabase) => {
	await createLegacyTables(database);
	await insertCadastro(database, 1);
	await insertEntry(database, { id: 10, counterpartId: 1, uuid: '00000000-0000-4000-8000-000000000010' });
};

describe('lancamentos migration', () => {
	it('TI-01 migrates entries, outputs and reversals with reconciled identifiers and sequence', async () => {
		await withMigrationDatabase(async (database) => {
			await createLegacyTables(database);
			await insertCadastro(database, 1);
			await insertEntry(database, {
				id: 10,
				counterpartId: 1,
				value: '100.10',
				uuid: '00000000-0000-4000-8000-000000000010',
				motivo: 'Duplicidade',
				userEstorno: 'admin',
				dataEstorno: '2026-09-04',
			});
			await insertEntry(database, {
				id: 20,
				counterpartId: 1,
				value: '50.05',
				depositado: true,
				uuid: '00000000-0000-4000-8000-000000000020',
			});
			await insertOutput(database, 8, '30.30');
			await insertOutput(database, 4, '20.20');

			await applyMigration(database);

			const entries = await database.unsafe<{ id: number; tipo: string; value: string }[]>(
				`SELECT idlancamento AS id, tipo, valor AS value FROM lancamentos ORDER BY idlancamento`,
			);
			const [reversal] = await database.unsafe<{ id: number; motivo: string }[]>(
				`SELECT idlancamento AS id, motivo FROM estornos`,
			);
			const [sequence] = await database.unsafe<{ id: number }[]>(
				`SELECT nextval('lancamentos_idlancamento_seq') AS id`,
			);
			const [oldTables] = await database.unsafe<{ entries: number; outputs: number }[]>(
				`SELECT
					(SELECT count(*)::int FROM information_schema.tables WHERE table_name = 'entradas') AS entries,
					(SELECT count(*)::int FROM information_schema.tables WHERE table_name = 'saidas') AS outputs`,
			);
			expect(entries).toEqual([
				{ id: 10, tipo: 'entrada', value: '100.10' },
				{ id: 20, tipo: 'entrada', value: '50.05' },
				{ id: 21, tipo: 'saida', value: '20.20' },
				{ id: 22, tipo: 'saida', value: '30.30' },
			]);
			expect(reversal).toEqual({ id: 10, motivo: 'Duplicidade' });
			expect(Number(sequence.id)).toBe(23);
			expect(oldTables).toEqual({ entries: 0, outputs: 0 });
		});
	});

	it('TI-01 handles an empty legacy origin and starts the shared sequence at one', async () => {
		await withMigrationDatabase(async (database) => {
			await createLegacyTables(database);
			await applyMigration(database);
			const [counts] = await database.unsafe<{ entries: number; reversals: number }[]>(
				`SELECT (SELECT count(*)::int FROM lancamentos) AS entries, (SELECT count(*)::int FROM estornos) AS reversals`,
			);
			const [next] = await database.unsafe<{ id: number }[]>(
				`SELECT nextval('lancamentos_idlancamento_seq') AS id`,
			);
			expect(counts).toEqual({ entries: 0, reversals: 0 });
			expect(Number(next.id)).toBe(1);
		});
	});

	it.each([
		[
			'invalid UUID',
			async (database: MigrationDatabase) => insertEntry(database, { id: 1, uuid: 'not-a-uuid' }),
			'invalid receipt UUID',
		],
		[
			'duplicate UUID',
			async (database: MigrationDatabase) => {
				await insertEntry(database, { id: 1, uuid: '00000000-0000-4000-8000-000000000001' });
				await insertEntry(database, { id: 2, uuid: '00000000-0000-4000-8000-000000000001' });
			},
			'duplicate receipt UUID',
		],
		[
			'missing counterpart',
			async (database: MigrationDatabase) => insertEntry(database, { id: 1, counterpartId: 404 }),
			'missing counterpart',
		],
		[
			'null deposit status',
			async (database: MigrationDatabase) => insertEntry(database, { id: 1, depositado: null }),
			'null deposit status',
		],
		[
			'partial reversal audit',
			async (database: MigrationDatabase) => insertEntry(database, { id: 1, motivo: 'Motivo' }),
			'incomplete reversal audit',
		],
		[
			'integer overflow',
			async (database: MigrationDatabase) => {
				await insertEntry(database, { id: 2147483647 });
				await insertOutput(database, 1);
			},
			'integer identifier overflow',
		],
	])('TI-02 rolls back %s during preflight', async (_name, setup, message) => {
		await withMigrationDatabase(async (database) => {
			await createLegacyTables(database);
			if (_name === 'missing counterpart') await setup(database);
			else {
				await insertCadastro(database, 1);
				await setup(database);
			}
			await expect(applyMigration(database)).rejects.toThrow(message);
			await assertRollback(database);
		});
	});

	it('TI-02 rolls back when reconciliation detects a divergent total', async () => {
		await withMigrationDatabase(async (database) => {
			await setupValidSource(database);
			const divergentMigration = migration.replace(
				'IF entry_source_total IS DISTINCT FROM entry_destination_total',
				'IF TRUE OR entry_source_total IS DISTINCT FROM entry_destination_total',
			);
			await expect(applyMigration(database, divergentMigration)).rejects.toThrow('totals');
			await assertRollback(database);
		});
	});
});

const withMigratedDatabase = async (callback: (database: MigrationDatabase) => Promise<void>) =>
	withMigrationDatabase(async (database) => {
		await setupValidSource(database);
		await applyMigration(database);
		await callback(database);
	});

describe('lancamentos migration constraints and triggers', () => {
	it('TI-06 rejects invalid shapes and missing registration audit', async () => {
		await withMigratedDatabase(async (database) => {
			await expect(
				database.unsafe(`INSERT INTO lancamentos (tipo, descricao, valor, data_lancamento, depositado, uuid_recibo)
				VALUES ('entrada', 'Sem contraparte', 10, '2026-09-05', false, '00000000-0000-4000-8000-000000000099')`),
			).rejects.toThrow();
			await expect(
				database.unsafe(`INSERT INTO lancamentos (tipo, descricao, valor, data_lancamento, data_registro, user_cadastro, depositado, uuid_recibo)
				VALUES ('entrada', 'Sem contraparte', 10, '2026-09-05', NULL, NULL, false, '00000000-0000-4000-8000-000000000098')`),
			).rejects.toThrow('registration audit');
		});
	});

	it('TI-06 permits only false-to-true deposit confirmation on an active entry', async () => {
		await withMigratedDatabase(async (database) => {
			await expect(
				database.unsafe(`UPDATE lancamentos SET descricao = 'Alterada' WHERE idlancamento = 10`),
			).rejects.toThrow('immutable');
			await expect(database.unsafe(`DELETE FROM lancamentos WHERE idlancamento = 10`)).rejects.toThrow(
				'immutable',
			);
			await database.unsafe(`UPDATE lancamentos SET depositado = true WHERE idlancamento = 10`);
			await expect(
				database.unsafe(`UPDATE lancamentos SET depositado = false WHERE idlancamento = 10`),
			).rejects.toThrow('immutable');
		});
	});

	it('TI-06 keeps reversal audit rows immutable', async () => {
		await withMigratedDatabase(async (database) => {
			await database.unsafe(`INSERT INTO estornos (idlancamento, motivo, user_estorno, data_estorno)
				VALUES (10, 'Teste', 'admin', '2026-09-05')`);
			await expect(
				database.unsafe(`UPDATE estornos SET motivo = 'Alterado' WHERE idlancamento = 10`),
			).rejects.toThrow('immutable');
			await expect(database.unsafe(`DELETE FROM estornos WHERE idlancamento = 10`)).rejects.toThrow('immutable');
		});
	});
});
