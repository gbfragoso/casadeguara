import { cadastros } from '$lib/database/schema';
import { eq } from 'drizzle-orm';

import type { CadastroDatabase } from './cadastro-database';

const updatePhoto = async (database: CadastroDatabase, id: number, foto: Uint8Array | null, userAlteracao: string) => {
	const startedAt = performance.now();

	try {
		const [updated] = await database
			.update(cadastros)
			.set({ foto, userAlteracao, dataAlteracao: new Date() })
			.where(eq(cadastros.idleitor, id))
			.returning({ id: cadastros.idleitor });
		const event = foto === null ? 'amigo_fraterno.photo_removed' : 'amigo_fraterno.photo_saved';
		const details = { cadastroId: id, actorId: userAlteracao, duration: performance.now() - startedAt };

		console.info(event, foto === null ? details : { ...details, inputSize: foto.byteLength, outputSize: foto.byteLength });
		return updated !== undefined;
	} catch (error) {
		console.error('amigo_fraterno.photo_persistence_failed', { cadastroId: id, actorId: userAlteracao, error });
		throw error;
	}
};

export const replaceSecretariaPhoto = (
	database: CadastroDatabase,
	id: number,
	foto: Uint8Array,
	userAlteracao: string,
) => updatePhoto(database, id, foto, userAlteracao);

export const removeSecretariaPhoto = (database: CadastroDatabase, id: number, userAlteracao: string) =>
	updatePhoto(database, id, null, userAlteracao);

export const getSecretariaPhoto = async (database: CadastroDatabase, id: number) => {
	const [cadastro] = await database
		.select({ foto: cadastros.foto })
		.from(cadastros)
		.where(eq(cadastros.idleitor, id))
		.limit(1);

	return cadastro?.foto === null || cadastro === undefined ? cadastro?.foto : new Uint8Array(cadastro.foto);
};
