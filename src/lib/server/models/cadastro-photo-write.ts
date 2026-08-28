import { cadastroFotos, cadastros } from '$lib/database/schema';
import { eq } from 'drizzle-orm';

import type { CadastroDatabase } from './cadastro-database';

const audit = (actorId: string) => ({ userAlteracao: actorId, dataAlteracao: new Date() });

export const logPhotoFailure = (id: number, actorId: string, operation: string, error: unknown) =>
	console.error('amigo_fraterno.photo_persistence_failed', { cadastroId: id, actorId, operation, error });

const replacePhotoInTransaction = (
	database: CadastroDatabase,
	id: number,
	source: Uint8Array,
	card: Uint8Array,
	actorId: string,
) =>
	database.transaction(async (transaction) => {
		const [updated] = await transaction
			.update(cadastros)
			.set(audit(actorId))
			.where(eq(cadastros.idleitor, id))
			.returning({ id: cadastros.idleitor });
		if (updated === undefined) return false;

		await transaction
			.insert(cadastroFotos)
			.values({ cadastroId: id, original: source, cartao: card })
			.onConflictDoUpdate({
				target: cadastroFotos.cadastroId,
				set: { original: source, cartao: card },
			});
		return true;
	});

const logPhotoSaved = (id: number, actorId: string, source: Uint8Array, card: Uint8Array, startedAt: number) =>
	console.info('amigo_fraterno.photo_saved', {
		cadastroId: id,
		actorId,
		inputSize: source.byteLength,
		sourceSize: source.byteLength,
		cardSize: card.byteLength,
		duration: performance.now() - startedAt,
	});

export const replaceSecretariaPhoto = async (
	database: CadastroDatabase,
	id: number,
	source: Uint8Array,
	card: Uint8Array,
	actorId: string,
) => {
	const startedAt = performance.now();
	try {
		const replaced = await replacePhotoInTransaction(database, id, source, card, actorId);

		if (replaced) logPhotoSaved(id, actorId, source, card, startedAt);
		return replaced;
	} catch (error) {
		logPhotoFailure(id, actorId, 'replace', error);
		throw error;
	}
};

export const removeSecretariaPhoto = async (database: CadastroDatabase, id: number, actorId: string) => {
	const startedAt = performance.now();
	try {
		const removed = await database.transaction(async (transaction) => {
			const [updated] = await transaction
				.update(cadastros)
				.set(audit(actorId))
				.where(eq(cadastros.idleitor, id))
				.returning({ id: cadastros.idleitor });
			if (updated === undefined) return false;

			await transaction.delete(cadastroFotos).where(eq(cadastroFotos.cadastroId, id));
			return true;
		});

		if (removed) {
			console.info('amigo_fraterno.photo_removed', {
				cadastroId: id,
				actorId,
				duration: performance.now() - startedAt,
			});
		}
		return removed;
	} catch (error) {
		logPhotoFailure(id, actorId, 'remove', error);
		throw error;
	}
};
