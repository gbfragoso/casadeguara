import { db } from '$lib/database/connection';
import { aviso } from '$lib/database/schema';
import { desc, eq, sql } from 'drizzle-orm';

export const RECENT_NOTICE_LIMIT = 5;

export type Aviso = {
	idaviso: number;
	dataCadastro: Date | null;
	texto: string;
	username: string | null;
};

const avisoFields = {
	idaviso: aviso.idaviso,
	dataCadastro: aviso.dataCadastro,
	texto: aviso.texto,
	username: aviso.username,
};

export class AvisoModel {
	constructor(private readonly database: typeof db = db) {}

	listRecent() {
		return this.database
			.select(avisoFields)
			.from(aviso)
			.orderBy(sql`${aviso.dataCadastro} desc nulls last`, desc(aviso.idaviso))
			.limit(RECENT_NOTICE_LIMIT);
	}

	async get(id: number) {
		const [found] = await this.database.select(avisoFields).from(aviso).where(eq(aviso.idaviso, id)).limit(1);

		return found;
	}

	async create(text: string, username: string): Promise<Aviso> {
		const [created] = await this.database.insert(aviso).values({ texto: text, username }).returning(avisoFields);

		if (!created) throw new Error('Aviso não foi criado.');

		return created;
	}

	async update(id: number, text: string) {
		const [updated] = await this.database
			.update(aviso)
			.set({ texto: text })
			.where(eq(aviso.idaviso, id))
			.returning({ idaviso: aviso.idaviso });

		return updated !== undefined;
	}
}

export const avisoModel = new AvisoModel();
