import { unaccent } from '#lib/server/database/functions.js';
import { cadastros } from '#lib/server/database/schema.js';
import { and, eq } from 'drizzle-orm';

import type { CadastroDatabase } from './cadastro-database';

export const listAttendanceWorkers = async (database: CadastroDatabase): Promise<string[]> => {
	const rows = await database
		.select({ nome: cadastros.nome })
		.from(cadastros)
		.where(and(eq(cadastros.trab, true), eq(cadastros.frequencia, true)))
		.orderBy(unaccent(cadastros.nome), cadastros.idleitor);
	return rows.map(({ nome }) => nome);
};
