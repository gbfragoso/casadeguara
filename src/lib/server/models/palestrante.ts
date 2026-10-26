import { db } from '#lib/server/database/connection.js';
import { normalizeSearch } from '#lib/forms/autocomplete.js';
import { escapeLikePattern } from '#lib/server/database/functions.js';
import { palestranteFotos, palestrantes } from '#lib/server/database/schema.js';
import type { SpeakerOption } from '#lib/talks/types.js';
import { asc, eq, like, sql } from 'drizzle-orm';

import { importSpeakerFromCadastro, searchImportCandidates } from './palestrante-import';
import {
	getSpeakerPhoto,
	reframeSpeakerPhoto,
	removeSpeakerPhoto,
	replaceSpeakerPhoto,
	type SpeakerPhotoSet,
	type SpeakerPhotoVariant,
} from './palestrante-photo';
import { createSpeaker, removeSpeaker, renameSpeaker } from './palestrante-write';

export const SPEAKER_LIST_LIMIT = 100;

export type SpeakerListItem = { id: number; nome: string; temFoto: boolean; importado: boolean };
export type SpeakerDetail = SpeakerListItem & { fotoVersao: string | null };

const speakerFields = {
	id: palestrantes.id,
	nome: palestrantes.nome,
	temFoto: sql<boolean>`${palestranteFotos.palestranteId} is not null`,
	importado: sql<boolean>`${palestrantes.cadastroId} is not null`,
};

const speakerDetailFields = {
	...speakerFields,
	fotoVersao: sql<string | null>`md5(${palestranteFotos.original} || ${palestranteFotos.quadrada})`,
};

export class PalestranteModel {
	constructor(private readonly database: typeof db = db) {}

	list(search: string): Promise<SpeakerListItem[]> {
		const pattern = `%${escapeLikePattern(normalizeSearch(search))}%`;

		return this.database
			.select(speakerFields)
			.from(palestrantes)
			.leftJoin(palestranteFotos, eq(palestranteFotos.palestranteId, palestrantes.id))
			.where(like(palestrantes.nomeBusca, pattern))
			.orderBy(asc(palestrantes.nomeBusca), asc(palestrantes.id))
			.limit(SPEAKER_LIST_LIMIT);
	}

	listOptions(): Promise<SpeakerOption[]> {
		return this.database
			.select({ id: palestrantes.id, nome: palestrantes.nome })
			.from(palestrantes)
			.orderBy(asc(palestrantes.nomeBusca), asc(palestrantes.id));
	}

	async get(id: number): Promise<SpeakerDetail | undefined> {
		const [speaker] = await this.database
			.select(speakerDetailFields)
			.from(palestrantes)
			.leftJoin(palestranteFotos, eq(palestranteFotos.palestranteId, palestrantes.id))
			.where(eq(palestrantes.id, id));
		return speaker;
	}

	create(nome: string, actorId: string): Promise<{ id: number }> {
		return createSpeaker(this.database, nome, actorId);
	}

	rename(id: number, nome: string, actorId: string): Promise<boolean> {
		return renameSpeaker(this.database, id, nome, actorId);
	}

	remove(id: number) {
		return removeSpeaker(this.database, id);
	}

	searchImportCandidates(search: string) {
		return searchImportCandidates(this.database, search);
	}

	importFromCadastro(cadastroId: number, actorId: string) {
		return importSpeakerFromCadastro(this.database, cadastroId, actorId);
	}

	getPhoto(id: number, variant: SpeakerPhotoVariant) {
		return getSpeakerPhoto(this.database, id, variant);
	}

	replacePhoto(id: number, photos: SpeakerPhotoSet, actorId: string) {
		return replaceSpeakerPhoto(this.database, id, photos, actorId);
	}

	reframePhoto(id: number, photos: SpeakerPhotoSet, actorId: string) {
		return reframeSpeakerPhoto(this.database, id, photos, actorId);
	}

	removePhoto(id: number, actorId: string) {
		return removeSpeakerPhoto(this.database, id, actorId);
	}
}

export const palestranteModel = new PalestranteModel();
