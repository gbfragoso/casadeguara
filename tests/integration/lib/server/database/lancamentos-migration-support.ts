import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import postgres from 'postgres';

import { withMigrationDatabase } from './migration-test-support';

export const migration = readFileSync(resolve('src/lib/server/database/0008_tiresome_klaw.sql'), 'utf8');
export type MigrationDatabase = ReturnType<typeof postgres>;

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

export async function createLegacyTables(database: MigrationDatabase) {
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

export const insertCadastro = (database: MigrationDatabase, id: number) =>
	database`INSERT INTO cadastros (idleitor, nome) VALUES (${id}, ${`Cadastro ${id}`})`;

export const insertEntry = (database: MigrationDatabase, values: EntryValues) =>
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

export const insertOutput = (database: MigrationDatabase, id: number, value = '20.00') =>
	database`INSERT INTO saidas (idsaida, descricao, valor, data_saida, user_cadastro, user_alteracao)
	VALUES (${id}, ${`Saída ${id}`}, ${value}, ${'2026-09-03'}, ${'legacy.output'}, ${null})`;

export const applyMigration = (database: MigrationDatabase, sql = migration) =>
	database.begin((transaction) => transaction.unsafe(sql));

export const setupValidSource = async (database: MigrationDatabase) => {
	await createLegacyTables(database);
	await insertCadastro(database, 1);
	await insertEntry(database, { id: 10, counterpartId: 1, uuid: '00000000-0000-4000-8000-000000000010' });
};

export const withMigratedDatabase = async (callback: (database: MigrationDatabase) => Promise<void>) =>
	withMigrationDatabase(async (database) => {
		await setupValidSource(database);
		await applyMigration(database);
		await callback(database);
	});

const descriptionMigration = readFileSync(resolve('src/lib/server/database/0010_lancamento_descricoes.sql'), 'utf8');

export const ACTIVE_ENTRY_ID = 10;
export const REVERSED_ENTRY_ID = 12;
export const OUTPUT_ID = 13;

type HistoryRow = {
	id: number;
	idlancamento: number;
	descricaoAnterior: string;
	descricaoNova: string;
	userAlteracao: string;
	dataAlteracao: Date;
};

async function seedLegacySource(database: MigrationDatabase) {
	await createLegacyTables(database);
	await insertCadastro(database, 1);
	await insertEntry(database, { id: ACTIVE_ENTRY_ID });
	await insertEntry(database, {
		id: REVERSED_ENTRY_ID,
		motivo: 'Duplicidade',
		userEstorno: 'admin',
		dataEstorno: '2026-09-04',
	});
	await insertOutput(database, 5);
}

export const withDescriptionMigration = (callback: (database: MigrationDatabase) => Promise<void>) =>
	withMigrationDatabase(async (database) => {
		await seedLegacySource(database);
		await applyMigration(database);
		await applyMigration(database, descriptionMigration);
		await callback(database);
	});

export const correctDescription = (database: MigrationDatabase, id: number, description: string, user: string | null) =>
	database`UPDATE lancamentos SET descricao = ${description}, user_alteracao = ${user} WHERE idlancamento = ${id}`;

export const readHistory = (database: MigrationDatabase) =>
	database<HistoryRow[]>`SELECT id, idlancamento, descricao_anterior AS "descricaoAnterior",
		descricao_nova AS "descricaoNova", user_alteracao AS "userAlteracao", data_alteracao AS "dataAlteracao"
		FROM lancamento_descricoes ORDER BY id`;

export const readEntry = async (database: MigrationDatabase, id: number) => {
	const [entry] = await database<{ descricao: string; userAlteracao: string | null; depositado: boolean | null }[]>`
		SELECT descricao, user_alteracao AS "userAlteracao", depositado FROM lancamentos WHERE idlancamento = ${id}`;
	return entry;
};
