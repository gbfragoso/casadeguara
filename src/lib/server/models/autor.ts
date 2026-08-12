import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { autor } from '$lib/database/schema';
import { eq } from 'drizzle-orm';

export const AUTHOR_FETCH_LIMIT = 50;
export type Autor = Pick<typeof autor.$inferSelect, 'idautor' | 'nome'>;

export class AutorModel {
	constructor(private readonly database: typeof db = db) {}

	async fetch(name: string): Promise<Autor[]> {
		const where = name ? ulike(autor.nome, `${name}%`) : undefined;

		return this.database
			.select({ idautor: autor.idautor, nome: autor.nome })
			.from(autor)
			.where(where)
			.orderBy(unaccent(autor.nome))
			.limit(AUTHOR_FETCH_LIMIT);
	}

	async get(id: number): Promise<Autor | undefined> {
		const [author] = await this.database
			.select({ idautor: autor.idautor, nome: autor.nome })
			.from(autor)
			.where(eq(autor.idautor, id));

		return author;
	}

	async create(name: string): Promise<void> {
		await this.database.insert(autor).values({ nome: name });
	}

	async update(id: number, name: string): Promise<boolean> {
		const [updated] = await this.database
			.update(autor)
			.set({ nome: name })
			.where(eq(autor.idautor, id))
			.returning({ idautor: autor.idautor });

		return updated !== undefined;
	}
}

export const autorModel = new AutorModel();
