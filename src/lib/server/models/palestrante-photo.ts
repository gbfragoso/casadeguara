import type { db } from '#lib/server/database/connection.js';
import { palestranteFotos, palestrantes } from '#lib/server/database/schema.js';
import { and, eq } from 'drizzle-orm';

type SpeakerDatabase = typeof db;
type SpeakerTransaction = Parameters<Parameters<SpeakerDatabase['transaction']>[0]>[0];

export type SpeakerPhotoVariant = 'quadrada' | 'miniatura' | 'original';
export type SpeakerPhotoSet = { original: Uint8Array; quadrada: Uint8Array; miniatura: Uint8Array };
export type SpeakerReframeOutcome = 'updated' | 'missing' | 'conflict';

const toPhoto = (photo: Uint8Array | null) => (photo === null ? null : new Uint8Array(photo));

const touchSpeaker = async (writer: SpeakerDatabase | SpeakerTransaction, id: number, actorId: string) => {
	const touched = await writer
		.update(palestrantes)
		.set({ userAlteracao: actorId, dataAlteracao: new Date() })
		.where(eq(palestrantes.id, id))
		.returning({ id: palestrantes.id });
	return touched.length > 0;
};

export const getSpeakerPhoto = async (database: SpeakerDatabase, id: number, variant: SpeakerPhotoVariant) => {
	const [row] = await database
		.select({ photo: palestranteFotos[variant] })
		.from(palestrantes)
		.leftJoin(palestranteFotos, eq(palestranteFotos.palestranteId, palestrantes.id))
		.where(eq(palestrantes.id, id))
		.limit(1);

	return row === undefined ? undefined : toPhoto(row.photo);
};

export const writeSpeakerPhoto = (writer: SpeakerDatabase | SpeakerTransaction, id: number, photos: SpeakerPhotoSet) =>
	writer
		.insert(palestranteFotos)
		.values({ palestranteId: id, ...photos })
		.onConflictDoUpdate({ target: palestranteFotos.palestranteId, set: photos });

const logPhotoEvent = (event: string, details: Record<string, unknown>, startedAt: number) =>
	console.info(`comunicacao.palestrantes.${event}`, { ...details, duracaoMs: performance.now() - startedAt });

export const replaceSpeakerPhoto = async (
	database: SpeakerDatabase,
	id: number,
	photos: SpeakerPhotoSet,
	actorId: string,
) => {
	const startedAt = performance.now();
	const replaced = await database.transaction(async (transaction) => {
		if (!(await touchSpeaker(transaction, id, actorId))) return false;
		await writeSpeakerPhoto(transaction, id, photos);
		return true;
	});

	if (replaced) {
		const sizes = { originalBytes: photos.original.byteLength, quadradaBytes: photos.quadrada.byteLength };
		logPhotoEvent('foto_salva', { palestranteId: id, actorId, ...sizes }, startedAt);
	}
	return replaced;
};

const reframeInTransaction = async (
	transaction: SpeakerTransaction,
	id: number,
	photos: SpeakerPhotoSet,
	actorId: string,
): Promise<SpeakerReframeOutcome> => {
	const [current] = await transaction
		.select({ id: palestranteFotos.palestranteId })
		.from(palestranteFotos)
		.where(eq(palestranteFotos.palestranteId, id))
		.for('update');
	if (current === undefined) return 'missing';

	const { quadrada, miniatura } = photos;
	const [updated] = await transaction
		.update(palestranteFotos)
		.set({ quadrada, miniatura })
		.where(and(eq(palestranteFotos.palestranteId, id), eq(palestranteFotos.original, photos.original)))
		.returning({ id: palestranteFotos.palestranteId });
	if (updated === undefined) return 'conflict';

	await touchSpeaker(transaction, id, actorId);
	return 'updated';
};

export const reframeSpeakerPhoto = async (
	database: SpeakerDatabase,
	id: number,
	photos: SpeakerPhotoSet,
	actorId: string,
) => {
	const startedAt = performance.now();
	const outcome = await database.transaction((transaction) => reframeInTransaction(transaction, id, photos, actorId));

	if (outcome === 'updated') {
		logPhotoEvent(
			'foto_reenquadrada',
			{ palestranteId: id, actorId, quadradaBytes: photos.quadrada.byteLength },
			startedAt,
		);
	}
	return outcome;
};

export const removeSpeakerPhoto = async (database: SpeakerDatabase, id: number, actorId: string) => {
	const startedAt = performance.now();
	const removed = await database.transaction(async (transaction) => {
		if (!(await touchSpeaker(transaction, id, actorId))) return false;
		await transaction.delete(palestranteFotos).where(eq(palestranteFotos.palestranteId, id));
		return true;
	});

	if (removed) logPhotoEvent('foto_removida', { palestranteId: id, actorId }, startedAt);
	return removed;
};
