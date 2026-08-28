import { randomUUID } from 'node:crypto';

import { db } from '$lib/server/database/connection';
import { cadastros } from '$lib/server/database/schema';
import { CadastroModel } from '$lib/server/models/cadastro';
import type { BibliotecaCreateData } from '$lib/server/models/cadastro-inputs';
import { eq } from 'drizzle-orm';

export const model = new CadastroModel(db);
const TEST_TOKEN_LENGTH = 16;
const TEST_ACTOR = 'integration-test';

export const createTestName = (suffix: string) =>
	`T${randomUUID().replaceAll('-', '').slice(0, TEST_TOKEN_LENGTH)}${suffix}`;

export const createBiblioteca = async (input: BibliotecaCreateData) => {
	const [created] = await model.createBiblioteca(input, TEST_ACTOR);

	if (!created) throw new Error('Cadastro de teste nÃ£o foi criado.');

	return created;
};

export const readCadastro = async (id: number) => {
	const [cadastro] = await db.select().from(cadastros).where(eq(cadastros.idleitor, id)).limit(1);

	return cadastro;
};

export const deleteCadastro = (id: number) => db.delete(cadastros).where(eq(cadastros.idleitor, id));

export const createRawCadastro = async (nome: string) => {
	const [created] = await db
		.insert(cadastros)
		.values({
			nome,
			rg: '123456789',
			cpf: '12345678909',
			email: 'original@example.com',
			celular: '71999999999',
			telefone: '7133333333',
			logradouro: 'Rua Original',
			bairro: 'Centro',
			complemento: 'Casa 1',
			cidade: 'Salvador',
			cep: '40000000',
			aniversario: new Date('2024-02-29'),
			trab: true,
			status: true,
			frequencia: true,
			desencarnado: true,
			incompleto: true,
			userCadastro: 'seed-actor',
		})
		.returning({ idleitor: cadastros.idleitor });

	if (!created) throw new Error('Cadastro de teste nÃ£o foi criado.');

	return created;
};

export const withBibliotecaCadastros = async <Result>(
	inputs: BibliotecaCreateData[],
	callback: (created: { idleitor: number }[]) => Promise<Result>,
) => {
	const created = await Promise.all(inputs.map(createBiblioteca));

	try {
		return await callback(created);
	} finally {
		await Promise.all(created.map(({ idleitor }) => deleteCadastro(idleitor)));
	}
};
