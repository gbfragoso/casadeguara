export type LancamentoSeed =
	| {
			tipo: 'entrada';
			descricao: string;
			valor: string;
			dataLancamento: string;
			contraparteId: number;
			depositado: boolean;
	  }
	| {
			tipo: 'saida';
			descricao: string;
			valor: string;
			dataLancamento: string;
			contraparteId?: number | null;
	  };

const dateForIndex = (index: number) => (index % 2 === 0 ? '2026-09-01' : '2026-09-02');

export const createEntrySeed = (
	token: string,
	suffix: string,
	contraparteId: number,
	options: Partial<Extract<LancamentoSeed, { tipo: 'entrada' }>> = {},
): Extract<LancamentoSeed, { tipo: 'entrada' }> => ({
	tipo: 'entrada',
	descricao: `E2E ${token} entrada ${suffix}`,
	valor: '150.00',
	dataLancamento: '2026-09-01',
	contraparteId,
	depositado: false,
	...options,
});

export const createExitSeed = (
	token: string,
	suffix: string,
	options: Partial<Extract<LancamentoSeed, { tipo: 'saida' }>> = {},
): Extract<LancamentoSeed, { tipo: 'saida' }> => ({
	tipo: 'saida',
	descricao: `E2E ${token} saida ${suffix}`,
	valor: '80.00',
	dataLancamento: '2026-09-02',
	contraparteId: null,
	...options,
});

export const createExitPageSeeds = (token: string, count: number) =>
	Array.from({ length: count }, (_, index) =>
		createExitSeed(token, `pagina-${index}`, { dataLancamento: dateForIndex(index) }),
	);
