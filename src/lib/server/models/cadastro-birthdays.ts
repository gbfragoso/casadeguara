import { unaccent } from '#lib/server/database/functions.js';
import { cadastros } from '#lib/server/database/schema.js';
import { and, eq, sql } from 'drizzle-orm';

import type { CadastroDatabase } from './cadastro-database';

export type BirthdaySource = { id: number; nome: string; dia: number; desencarnado: boolean };

const birthdayDay = sql<number>`extract(day from ${cadastros.aniversario})::int`;
const birthdayMonth = sql<number>`extract(month from ${cadastros.aniversario})`;

export const listMonthBirthdays = (database: CadastroDatabase, month: number): Promise<BirthdaySource[]> =>
	database
		.select({
			id: cadastros.idleitor,
			nome: cadastros.nome,
			dia: birthdayDay,
			desencarnado: sql<boolean>`${cadastros.desencarnado} is true`,
		})
		.from(cadastros)
		.where(and(eq(cadastros.trab, true), eq(birthdayMonth, month)))
		.orderBy(birthdayDay, unaccent(cadastros.nome), cadastros.idleitor);
