import { db } from '#lib/server/database/connection.js';
import { normalizeSearch } from '#lib/forms/autocomplete.js';
import { palestranteFotos, palestrantes } from '#lib/server/database/schema.js';
import type { SpeakerOption } from '#lib/talks/types.js';
import { asc, eq, like, sql } from 'drizzle-orm';

import { createSpeaker, removeSpeaker, renameSpeaker } from './palestrante-write';

export const SPEAKER_LIST_LIMIT = 100;

export type SpeakerListItem = { id: number; nome: string; temFoto: boolean; importado: boolean };
export type SpeakerDetail = SpeakerListItem;

const LIKE_WILDCARD_PATTERN = /[\\%_]/g;

const escapeLikePattern = (text: string) => text.replace(LIKE_WILDCARD_PATTERN, '\\$&');

const speakerFields = {
	id: palestrantes.id,
	nome: palestrantes.nome,
	temFoto: sql<boolean>`${palestranteFotos.palestranteId} is not null`,
	importado: sql<boolean>`${palestrantes.cadastroId} is not null`,
};

export class PalestranteModel {
	constructor(private readonly database: typeof db = db) {}

	list(search: string): Promise<SpeakerListItem[]> {
		const pattern = `%${escapeLikePattern(normalizeSearch(search))}%`;

		return this.selectSpeakers()
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
		const [speaker] = await this.selectSpeakers().where(eq(palestrantes.id, id));
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

	private selectSpeakers() {
		return this.database
			.select(speakerFields)
			.from(palestrantes)
			.leftJoin(palestranteFotos, eq(palestranteFotos.palestranteId, palestrantes.id))
			.$dynamic();
	}
}

export const palestranteModel = new PalestranteModel();
