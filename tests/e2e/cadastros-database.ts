import 'dotenv/config';

import { randomUUID } from 'node:crypto';
import { hash } from 'argon2';
import postgres from 'postgres';

const databaseUrl = process.env.POSTGRES_URL;
if (!databaseUrl) throw new Error('POSTGRES_URL is required for cadastro E2E tests.');

const TEST_USER_TOKEN_LENGTH = 9;
export type TestDatabase = postgres.Sql;

export const createDatabase = (): TestDatabase => postgres(databaseUrl, { max: 4 });

export type TestUser = { id: string; email: string; password: string };
export type TestUsers = { owner: TestUser; wrongRole: TestUser; tesouraria: TestUser };
export type CadastroSnapshot = {
	idleitor: number;
	nome: string;
	rg: string | null;
	cpf: string | null;
	email: string | null;
	celular: string | null;
	telefone: string | null;
	logradouro: string | null;
	bairro: string | null;
	complemento: string | null;
	cidade: string | null;
	cep: string | null;
	aniversario: Date | null;
	trab: boolean | null;
	status: boolean | null;
	frequencia: boolean | null;
	desencarnado: boolean | null;
	amigo_fraterno: boolean;
	foto: Uint8Array | null;
};

const createUser = (token: string, suffix: string, password: string): TestUser => ({
	id: `e2e-${suffix}-${token.slice(0, TEST_USER_TOKEN_LENGTH)}`,
	email: `e2e-${suffix}-${token.slice(0, TEST_USER_TOKEN_LENGTH)}@t.dev`,
	password,
});

const insertUser = async (database: TestDatabase, user: TestUser, roles: string, passwordHash: string) => {
	await database`
		insert into "User" (id, username, name, password_hash, roles)
		values (${user.id}, ${user.email}, ${`E2E ${user.id.slice(0, 20)}`}, ${passwordHash}, ${roles})
	`;
};

export const createTestUsers = async (database: TestDatabase, token: string): Promise<TestUsers> => {
	const password = randomUUID();
	const owner = createUser(token, 'owner', password);
	const wrongRole = createUser(token, 'wrong', password);
	const tesouraria = createUser(token, 'tesouraria', password);
	const passwordHash = await hash(password);

	await insertUser(database, owner, 'biblioteca,secretaria,tesouraria', passwordHash);
	await insertUser(database, wrongRole, 'biblioteca', passwordHash);
	await insertUser(database, tesouraria, 'tesouraria', passwordHash);

	return { owner, wrongRole, tesouraria };
};
export const readCadastro = async (database: TestDatabase, name: string): Promise<CadastroSnapshot> => {
	const [cadastro] = await database<CadastroSnapshot[]>`
		select c.idleitor, c.nome, c.rg, c.cpf, c.email, c.celular, c.telefone, c.logradouro, c.bairro,
			c.complemento, c.cidade, c.cep, c.aniversario, c.trab, c.status, c.frequencia, c.desencarnado,
			c.amigo_fraterno, f.original as foto
		from cadastros c
		left join cadastro_fotos f on f.cadastro_id = c.idleitor
		where c.nome = ${name}
	`;

	if (!cadastro) throw new Error('Cadastro de teste não foi encontrado.');

	return cadastro;
};

export const deleteCadastro = (database: TestDatabase, name: string) =>
	database`delete from cadastros where nome = ${name}`;

export const deleteTestUsers = async (database: TestDatabase, { owner, wrongRole, tesouraria }: TestUsers) => {
	const ids = [owner.id, wrongRole.id, tesouraria.id];
	await database`delete from "Session" where "userId" = any(${ids})`;
	await database`delete from "User" where id = any(${ids})`;
};

export const advanceCadastroSequence = (database: TestDatabase, value: number) =>
	database`select setval(pg_get_serial_sequence('cadastros', 'idleitor'), ${value}, true)`;

export const restoreCadastroSequence = (database: TestDatabase) =>
	database`select setval(
		pg_get_serial_sequence('cadastros', 'idleitor'),
		coalesce((select max(idleitor) from cadastros), 1),
		true
	)`;

export const closeDatabase = (database: TestDatabase) => database.end();
