import type { db } from '#lib/server/database/connection.js';
import { normalizeSearch } from '#lib/forms/autocomplete.js';
import { escapeLikePattern, ulike, unaccent } from '#lib/server/database/functions.js';
import { cadastroFotos, cadastros, palestranteFotos, palestrantes } from '#lib/server/database/schema.js';
import { createSquarePhoto, createThumbnail } from '#lib/server/image/cropper.js';
import { and, asc, eq, sql, type SQL } from 'drizzle-orm';

import { DuplicatePalestranteNameError, isSpeakerOriginViolation } from './palestrante-error';
import { writeSpeakerPhoto, type SpeakerPhotoSet } from './palestrante-photo';
import { createSpeaker } from './palestrante-write';

type SpeakerDatabase = typeof db;
type SpeakerTransaction = Parameters<Parameters<SpeakerDatabase['transaction']>[0]>[0];
type ImportSource = { cadastroId: number; nome: string; photos: SpeakerPhotoSet | null };

export const IMPORT_SEARCH_LIMIT = 50;

const isAlive = sql`${cadastros.desencarnado} is not true`;

const CENTERED_POSITION = { focalX: 0.5, focalY: 0.5, zoom: 1 };

export type ImportCandidate = { cadastroId: number; nome: string; temFoto: boolean; palestranteId: number | null };
export type SpeakerImportOutcome =
	| { status: 'created' | 'linked'; palestranteId: number }
	| { status: 'missing' | 'already-imported' | 'duplicate-name' };

export const searchImportCandidates = (database: SpeakerDatabase, search: string): Promise<ImportCandidate[]> =>
	database
		.select({
			cadastroId: cadastros.idleitor,
			nome: cadastros.nome,
			temFoto: sql<boolean>`${cadastroFotos.cadastroId} is not null`,
			palestranteId: palestrantes.id,
		})
		.from(cadastros)
		.leftJoin(cadastroFotos, eq(cadastroFotos.cadastroId, cadastros.idleitor))
		.leftJoin(palestrantes, eq(palestrantes.cadastroId, cadastros.idleitor))
		.where(and(isAlive, ulike(cadastros.nome, `%${escapeLikePattern(search)}%`)))
		.orderBy(unaccent(cadastros.nome), asc(cadastros.idleitor))
		.limit(IMPORT_SEARCH_LIMIT);

const createImportedPhotos = async (original: Uint8Array): Promise<SpeakerPhotoSet> => {
	const quadrada = await createSquarePhoto(original, CENTERED_POSITION);
	return { original, quadrada, miniatura: await createThumbnail(quadrada) };
};

const readImportSource = async (database: SpeakerDatabase, cadastroId: number): Promise<ImportSource | undefined> => {
	const [row] = await database
		.select({ nome: cadastros.nome, original: cadastroFotos.original })
		.from(cadastros)
		.leftJoin(cadastroFotos, eq(cadastroFotos.cadastroId, cadastros.idleitor))
		.where(and(eq(cadastros.idleitor, cadastroId), isAlive))
		.limit(1);
	if (row === undefined) return undefined;

	const photos = row.original === null ? null : await createImportedPhotos(new Uint8Array(row.original));
	return { cadastroId, nome: row.nome, photos };
};

const findSpeaker = async (transaction: SpeakerTransaction, condition: SQL) => {
	const [speaker] = await transaction
		.select({ id: palestrantes.id, cadastroId: palestrantes.cadastroId, temFoto: palestranteFotos.palestranteId })
		.from(palestrantes)
		.leftJoin(palestranteFotos, eq(palestranteFotos.palestranteId, palestrantes.id))
		.where(condition)
		.for('update', { of: palestrantes });
	return speaker;
};

const linkHomonym = async (transaction: SpeakerTransaction, id: number, source: ImportSource, actorId: string) => {
	await transaction
		.update(palestrantes)
		.set({ cadastroId: source.cadastroId, userAlteracao: actorId, dataAlteracao: new Date() })
		.where(eq(palestrantes.id, id));
};

const importInTransaction = async (
	transaction: SpeakerTransaction,
	source: ImportSource,
	actorId: string,
): Promise<SpeakerImportOutcome> => {
	if (await findSpeaker(transaction, eq(palestrantes.cadastroId, source.cadastroId))) {
		return { status: 'already-imported' };
	}

	const homonym = await findSpeaker(transaction, eq(palestrantes.nomeBusca, normalizeSearch(source.nome)));
	if (homonym === undefined) {
		const { id } = await createSpeaker(transaction, source.nome, actorId, source.cadastroId);
		if (source.photos) await writeSpeakerPhoto(transaction, id, source.photos);
		return { status: 'created', palestranteId: id };
	}
	if (homonym.cadastroId !== null) return { status: 'duplicate-name' };

	await linkHomonym(transaction, homonym.id, source, actorId);
	if (source.photos && homonym.temFoto === null) await writeSpeakerPhoto(transaction, homonym.id, source.photos);
	return { status: 'linked', palestranteId: homonym.id };
};

const translateImportRace = (error: unknown): SpeakerImportOutcome => {
	if (error instanceof DuplicatePalestranteNameError) return { status: 'duplicate-name' };
	if (isSpeakerOriginViolation(error)) return { status: 'already-imported' };
	throw error;
};

export const importSpeakerFromCadastro = async (
	database: SpeakerDatabase,
	cadastroId: number,
	actorId: string,
): Promise<SpeakerImportOutcome> => {
	const source = await readImportSource(database, cadastroId);
	if (source === undefined) return { status: 'missing' };

	const outcome = await database
		.transaction((transaction) => importInTransaction(transaction, source, actorId))
		.catch(translateImportRace);

	if (outcome.status === 'created' || outcome.status === 'linked') {
		const { palestranteId, status } = outcome;
		console.info('comunicacao.palestrantes.importado', {
			palestranteId,
			cadastroId,
			status,
			comFoto: source.photos !== null,
		});
	}
	return outcome;
};
