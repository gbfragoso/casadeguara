import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { serie } from '$lib/database/schema';
import { eq } from 'drizzle-orm';

export const COLLECTION_FETCH_LIMIT = 50;

const collectionFields = {
	idserie: serie.idserie,
	nome: serie.nome,
};

export class ColecaoModel {
	constructor(private readonly database: typeof db = db) {}

	fetch(name: string) {
		const where = name ? ulike(serie.nome, `${name}%`) : undefined;

		return this.database
			.select(collectionFields)
			.from(serie)
			.where(where)
			.orderBy(unaccent(serie.nome))
			.limit(COLLECTION_FETCH_LIMIT);
	}

	async get(id: number) {
		const [found] = await this.database.select(collectionFields).from(serie).where(eq(serie.idserie, id)).limit(1);

		return found;
	}

	create(name: string) {
		return this.database.insert(serie).values({ nome: name }).returning(collectionFields);
	}

	async update(id: number, name: string) {
		const [updated] = await this.database
			.update(serie)
			.set({ nome: name })
			.where(eq(serie.idserie, id))
			.returning({ idserie: serie.idserie });

		return updated !== undefined;
	}
}

export const colecaoModel = new ColecaoModel();
