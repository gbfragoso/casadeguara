import { ulike, unaccent } from '$lib/server/database/functions';
import { cadastroFotos, cadastros } from '$lib/server/database/schema';
import { and, eq } from 'drizzle-orm';

import type { CadastroDatabase } from './cadastro-database';
import {
	bibliotecaDetailFields,
	bibliotecaListFields,
	secretariaDetailFields,
	secretariaListFields,
	tesourariaDetailFields,
	tesourariaListFields,
} from './cadastro-projections';

export const CADASTRO_FETCH_LIMIT = 50;
export const WORKER_CADASTRO_FETCH_LIMIT = 500;

export const fetchBiblioteca = (database: CadastroDatabase, name: string) => {
	const where = name ? ulike(cadastros.nome, `${name}%`) : undefined;

	return database
		.select(bibliotecaListFields)
		.from(cadastros)
		.where(where)
		.orderBy(unaccent(cadastros.nome))
		.limit(CADASTRO_FETCH_LIMIT);
};

export const getBiblioteca = async (database: CadastroDatabase, id: number) => {
	const [cadastro] = await database
		.select(bibliotecaDetailFields)
		.from(cadastros)
		.where(eq(cadastros.idleitor, id))
		.limit(1);

	return cadastro;
};

export const fetchSecretaria = (database: CadastroDatabase, name: string, workersOnly: boolean) => {
	const nameFilter = name ? ulike(cadastros.nome, `${name}%`) : undefined;
	const workerFilter = workersOnly ? eq(cadastros.trab, true) : undefined;
	const limit = workersOnly ? WORKER_CADASTRO_FETCH_LIMIT : CADASTRO_FETCH_LIMIT;

	return database
		.select(secretariaListFields)
		.from(cadastros)
		.where(and(nameFilter, workerFilter))
		.orderBy(unaccent(cadastros.nome))
		.limit(limit);
};

export const getSecretaria = async (database: CadastroDatabase, id: number) => {
	const [cadastro] = await database
		.select(secretariaDetailFields)
		.from(cadastros)
		.leftJoin(cadastroFotos, eq(cadastroFotos.cadastroId, cadastros.idleitor))
		.where(eq(cadastros.idleitor, id))
		.limit(1);

	return cadastro;
};

export const fetchTesouraria = (database: CadastroDatabase, name: string) => {
	const where = name ? ulike(cadastros.nome, `${name}%`) : undefined;

	return database
		.select(tesourariaListFields)
		.from(cadastros)
		.where(where)
		.orderBy(unaccent(cadastros.nome))
		.limit(CADASTRO_FETCH_LIMIT);
};

export const getTesouraria = async (database: CadastroDatabase, id: number) => {
	const [cadastro] = await database
		.select(tesourariaDetailFields)
		.from(cadastros)
		.where(eq(cadastros.idleitor, id))
		.limit(1);

	return cadastro;
};
