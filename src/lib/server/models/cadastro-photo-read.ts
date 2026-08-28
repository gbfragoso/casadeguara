import { cadastroFotos, cadastros } from '$lib/database/schema';
import { eq } from 'drizzle-orm';

import type { CadastroDatabase } from './cadastro-database';

const toPhoto = (photo: Uint8Array | null | undefined) =>
	photo === undefined || photo === null ? photo : new Uint8Array(photo);

export const getCardPhoto = async (database: CadastroDatabase, id: number) => {
	const [row] = await database
		.select({ photo: cadastroFotos.cartao })
		.from(cadastros)
		.leftJoin(cadastroFotos, eq(cadastroFotos.cadastroId, cadastros.idleitor))
		.where(eq(cadastros.idleitor, id))
		.limit(1);

	return row === undefined ? undefined : toPhoto(row.photo);
};

export const getSourcePhoto = async (database: CadastroDatabase, id: number) => {
	const [row] = await database
		.select({ photo: cadastroFotos.original })
		.from(cadastros)
		.leftJoin(cadastroFotos, eq(cadastroFotos.cadastroId, cadastros.idleitor))
		.where(eq(cadastros.idleitor, id))
		.limit(1);

	return row === undefined ? undefined : toPhoto(row.photo);
};
