import { db } from '$lib/server/database/connection';
import { ulike, unaccent } from '$lib/server/database/functions';
import { editora } from '$lib/server/database/schema';
import { eq } from 'drizzle-orm';

export const PUBLISHER_FETCH_LIMIT = 50;

const publisherFields = {
	ideditora: editora.ideditora,
	nome: editora.nome,
};

export class EditoraModel {
	constructor(private readonly database: typeof db = db) {}

	fetch(name: string) {
		const where = name ? ulike(editora.nome, `${name}%`) : undefined;

		return this.database
			.select(publisherFields)
			.from(editora)
			.where(where)
			.orderBy(unaccent(editora.nome))
			.limit(PUBLISHER_FETCH_LIMIT);
	}

	async get(id: number) {
		const [publisher] = await this.database
			.select(publisherFields)
			.from(editora)
			.where(eq(editora.ideditora, id))
			.limit(1);

		return publisher;
	}

	create(name: string) {
		return this.database.insert(editora).values({ nome: name }).returning(publisherFields);
	}

	async update(id: number, name: string) {
		const [updated] = await this.database
			.update(editora)
			.set({ nome: name })
			.where(eq(editora.ideditora, id))
			.returning({ ideditora: editora.ideditora });

		return updated !== undefined;
	}
}

export const editoraModel = new EditoraModel();
