import { cadastroFotos, cadastros } from '$lib/server/database/schema';
import { and, eq } from 'drizzle-orm';

import type { CadastroDatabase } from './cadastro-database';
import { logPhotoFailure } from './cadastro-photo-write';

const sameBytes = (left: Uint8Array, right: Uint8Array) =>
	left.byteLength === right.byteLength && left.every((byte, index) => byte === right[index]);

const reframePhotoInTransaction = (
	database: CadastroDatabase,
	id: number,
	expectedSource: Uint8Array,
	card: Uint8Array,
	actorId: string,
) =>
	database.transaction(async (transaction) => {
		const [current] = await transaction
			.select({ source: cadastroFotos.original })
			.from(cadastros)
			.leftJoin(cadastroFotos, eq(cadastroFotos.cadastroId, cadastros.idleitor))
			.where(eq(cadastros.idleitor, id))
			.limit(1);
		if (current === undefined || current.source === null) return 'missing' as const;
		if (!sameBytes(new Uint8Array(current.source), expectedSource)) return 'conflict' as const;
		const [updatedPhoto] = await transaction
			.update(cadastroFotos)
			.set({ cartao: card })
			.where(and(eq(cadastroFotos.cadastroId, id), eq(cadastroFotos.original, expectedSource)))
			.returning({ id: cadastroFotos.cadastroId });
		if (updatedPhoto === undefined) return 'conflict' as const;
		const [updatedCadastro] = await transaction
			.update(cadastros)
			.set({ userAlteracao: actorId, dataAlteracao: new Date() })
			.where(eq(cadastros.idleitor, id))
			.returning({ id: cadastros.idleitor });
		return updatedCadastro === undefined ? ('missing' as const) : ('updated' as const);
	});

const logReframeOutcome = (
	result: 'updated' | 'missing' | 'conflict',
	id: number,
	actorId: string,
	card: Uint8Array,
	startedAt: number,
) => {
	if (result === 'updated') {
		console.info('amigo_fraterno.photo_reframed', {
			cadastroId: id,
			actorId,
			cardSize: card.byteLength,
			duration: performance.now() - startedAt,
		});
	} else if (result === 'conflict') {
		console.warn('amigo_fraterno.photo_conflict', { cadastroId: id, actorId });
	}
};

export const reframeSecretariaPhoto = async (
	database: CadastroDatabase,
	id: number,
	expectedSource: Uint8Array,
	card: Uint8Array,
	actorId: string,
): Promise<'updated' | 'missing' | 'conflict'> => {
	const startedAt = performance.now();
	try {
		const result = await reframePhotoInTransaction(database, id, expectedSource, card, actorId);
		logReframeOutcome(result, id, actorId, card, startedAt);
		return result;
	} catch (error) {
		logPhotoFailure(id, actorId, 'reframe', error);
		throw error;
	}
};
