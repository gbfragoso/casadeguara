import { asc, eq } from 'drizzle-orm';
import { cadastros } from '$lib/server/database/schema';
import type { CounterpartOption, LancamentoDatabase, LancamentoTransaction } from './types';
import { validationError } from './errors';

const counterpartProjection = { id: cadastros.idleitor, nome: cadastros.nome };

export const listCounterparts = (database: LancamentoDatabase): Promise<CounterpartOption[]> =>
	database.select(counterpartProjection).from(cadastros).orderBy(asc(cadastros.nome));

export const assertCounterpart = async (database: LancamentoTransaction, id: number) => {
	const [counterpart] = await database
		.select({ id: cadastros.idleitor })
		.from(cadastros)
		.where(eq(cadastros.idleitor, id))
		.limit(1);
	if (!counterpart) throw validationError('Contraparte não encontrada.');
};
