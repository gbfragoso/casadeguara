import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { autor } from '$lib/database/schema';
import { eq } from 'drizzle-orm';

export const AUTHOR_FETCH_LIMIT = 50;

const authorFields = {
	idautor: autor.idautor,
	nome: autor.nome,
};

export class AutorModel {
	constructor(private readonly database: typeof db = db) {}

	fetch(name: string) {
		const where = name ? ulike(autor.nome, `${name}%`) : undefined;

		return this.database
			.select(authorFields)
			.from(autor)
			.where(where)
			.orderBy(unaccent(autor.nome))
			.limit(AUTHOR_FETCH_LIMIT);
	}

	async get(id: number) {
		const [author] = await this.database.select(authorFields).from(autor).where(eq(autor.idautor, id)).limit(1);

		return author;
	}

	create(name: string) {
		return this.database.insert(autor).values({ nome: name }).returning(authorFields);
	}

	async update(id: number, name: string) {
		const [updated] = await this.database
			.update(autor)
			.set({ nome: name })
			.where(eq(autor.idautor, id))
			.returning({ idautor: autor.idautor });

		return updated !== undefined;
	}
}

export const autorModel = new AutorModel();
