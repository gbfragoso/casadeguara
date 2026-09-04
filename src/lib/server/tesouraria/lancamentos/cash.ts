import { and, desc, eq } from 'drizzle-orm';
import { activeLancamentoPredicate, cadastros, lancamentos } from '$lib/server/database/schema';
import type { CashEntry, LancamentoDatabase } from './types';

export const listPendingDeposits = (database: LancamentoDatabase): Promise<CashEntry[]> =>
	database
		.select({
			identrada: lancamentos.idlancamento,
			descricao: lancamentos.descricao,
			dataEntrada: lancamentos.dataLancamento,
			valor: lancamentos.valor,
			depositado: lancamentos.depositado,
			uuid: lancamentos.uuidRecibo,
			contribuinte: cadastros.nome,
			idcontribuinte: cadastros.idleitor,
			trabalhador: cadastros.trab,
		})
		.from(lancamentos)
		.innerJoin(cadastros, eq(cadastros.idleitor, lancamentos.idcontraparte))
		.where(and(eq(lancamentos.tipo, 'entrada'), eq(lancamentos.depositado, false), activeLancamentoPredicate()))
		.orderBy(desc(lancamentos.dataLancamento), desc(lancamentos.idlancamento))
		.then((rows) => rows.filter((row): row is CashEntry => row.depositado === false && row.uuid !== null));
