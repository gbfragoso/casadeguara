import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { keyword } from '$lib/database/schema';
import { eq } from 'drizzle-orm';

export const KEYWORD_FETCH_LIMIT = 50;

const keywordFields = {
	idkeyword: keyword.idkeyword,
	chave: keyword.chave,
};

export class KeywordModel {
	constructor(private readonly database: typeof db = db) {}

	fetch(key: string) {
		const where = key ? ulike(keyword.chave, `${key}%`) : undefined;

		return this.database
			.select(keywordFields)
			.from(keyword)
			.where(where)
			.orderBy(unaccent(keyword.chave))
			.limit(KEYWORD_FETCH_LIMIT);
	}

	async get(id: number) {
		const [found] = await this.database.select(keywordFields).from(keyword).where(eq(keyword.idkeyword, id)).limit(1);

		return found;
	}

	create(key: string) {
		return this.database.insert(keyword).values({ chave: key }).returning(keywordFields);
	}

	async update(id: number, key: string) {
		const [updated] = await this.database
			.update(keyword)
			.set({ chave: key })
			.where(eq(keyword.idkeyword, id))
			.returning({ idkeyword: keyword.idkeyword });

		return updated !== undefined;
	}
}

export const keywordModel = new KeywordModel();
