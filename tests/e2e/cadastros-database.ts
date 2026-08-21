import 'dotenv/config';

import { randomUUID } from 'node:crypto';
import { hash } from 'argon2';
import postgres from 'postgres';

const databaseUrl = process.env.POSTGRES_URL;
if (!databaseUrl) throw new Error('POSTGRES_URL is required for cadastro E2E tests.');

export const sql = postgres(databaseUrl);

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
	id: `e2e-${suffix}-${token}`,
	email: `e2e-${suffix}-${token}@t.dev`,
	password,
});

const insertUser = async (user: TestUser, roles: string, passwordHash: string) => {
	await sql`
		insert into "User" (id, username, name, password_hash, roles)
		values (${user.id}, ${user.email}, ${`E2E ${user.id.slice(0, 20)}`}, ${passwordHash}, ${roles})
	`;
};

export const createTestUsers = async (token: string): Promise<TestUsers> => {
	const password = randomUUID();
	const owner = createUser(token, 'owner', password);
	const wrongRole = createUser(token, 'wrong', password);
	const tesouraria = createUser(token, 'tesouraria', password);
	const passwordHash = await hash(password);

	await insertUser(owner, 'biblioteca,secretaria,tesouraria', passwordHash);
	await insertUser(wrongRole, 'biblioteca', passwordHash);
	await insertUser(tesouraria, 'tesouraria', passwordHash);

	return { owner, wrongRole, tesouraria };
};
export const readCadastro = async (name: string): Promise<CadastroSnapshot> => {
	const [cadastro] = await sql<CadastroSnapshot[]>`
		select idleitor, nome, rg, cpf, email, celular, telefone, logradouro, bairro, complemento, cidade, cep,
			aniversario, trab, status, frequencia, desencarnado, amigo_fraterno, foto
		from cadastros
		where nome = ${name}
	`;

	if (!cadastro) throw new Error('Cadastro de teste não foi encontrado.');

	return cadastro;
};

export const deleteCadastro = (name: string) => sql`delete from cadastros where nome = ${name}`;

export const deleteTestUsers = async ({ owner, wrongRole, tesouraria }: TestUsers) => {
	const ids = [owner.id, wrongRole.id, tesouraria.id];
	await sql`delete from "Session" where "userId" = any(${ids})`;
	await sql`delete from "User" where id = any(${ids})`;
};

export const closeDatabase = () => sql.end();
