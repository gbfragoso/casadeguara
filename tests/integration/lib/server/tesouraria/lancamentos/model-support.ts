import { cadastros } from '$lib/server/database/schema';
import type { LancamentoDatabase } from '$lib/server/tesouraria/lancamentos/types';
import { createTestName } from '../../models/cadastro/test-support';

export const entryInput = (contraparteId: number, descricao: string) => ({
	tipo: 'entrada' as const,
	contraparteId,
	descricao,
	valor: '150.00',
	dataLancamento: '2026-09-01',
	depositado: false,
});

export const exitInput = (descricao: string) => ({
	tipo: 'saida' as const,
	contraparteId: null,
	descricao,
	valor: '80.00',
	dataLancamento: '2026-09-02',
});

export const createCounterpart = async (database: LancamentoDatabase, suffix: string) => {
	const [created] = await database
		.insert(cadastros)
		.values({ nome: createTestName(suffix), trab: true })
		.returning({ id: cadastros.idleitor });
	if (!created) throw new Error('counterpart not created');
	return created.id;
};
