import { describe, expect, it } from 'vitest';

import {
	confirmDepositsSchema,
	createLancamentoFormSchema,
	depositIdsSchema,
	estornoReasonSchema,
	estornoSearchSchema,
	lancamentoSearchSchema,
} from '$lib/validation/tesouraria/lancamentos';
import { getFieldErrors } from '../field-errors';

const entry = {
	tipo: 'entrada',
	contraparteId: '42',
	descricao: 'Contribuição mensal',
	valor: '150.00',
	dataLancamento: '2026-09-02',
};

describe('lancamento validation', () => {
	it('validates an entry variant and normalizes form values', () => {
		const result = createLancamentoFormSchema.safeParse({ ...entry, depositado: 'on' });

		expect(result).toMatchObject({
			success: true,
			data: { tipo: 'entrada', contraparteId: 42, valor: '150.00', depositado: true },
		});
	});

	it('associates missing entry counterpart errors with the field', () => {
		const result = createLancamentoFormSchema.safeParse({ ...entry, contraparteId: '' });

		expect(getFieldErrors(result)?.contraparteId).toEqual(['Contraparte é obrigatória para entradas.']);
	});

	it('accepts an exit without counterpart and rejects entry-only fields', () => {
		const valid = createLancamentoFormSchema.safeParse({ ...entry, tipo: 'saida', contraparteId: '' });
		const invalid = createLancamentoFormSchema.safeParse({
			...entry,
			tipo: 'saida',
			contraparteId: '',
			depositado: 'true',
		});

		expect(valid).toMatchObject({ success: true, data: { tipo: 'saida', contraparteId: null } });
		expect(invalid.success).toBe(false);
	});

	it('rejects invalid dates, values and numeric-only descriptions', () => {
		const invalid = createLancamentoFormSchema.safeParse({
			...entry,
			dataLancamento: '2026-02-29',
			valor: 'R$ 1',
			descricao: '123.00',
		});

		expect(getFieldErrors(invalid)).toMatchObject({
			dataLancamento: ['Data do lançamento inválida.'],
			valor: ['Valor inválido.'],
			descricao: ['Descrição não pode conter somente números.'],
		});
	});

	it('normalizes operational filters and rejects incompatible entry filters', () => {
		const entryFilters = lancamentoSearchSchema.safeParse({
			tipo: 'entrada',
			contraparte: '  Ana  ',
			dataInicio: ' 2026-01-01 ',
			dataRegistro: ' 2026-09-02 ',
			depositado: 'true',
		});
		const allTypesDateFilter = lancamentoSearchSchema.safeParse({ dataRegistro: '2026-09-02' });
		const exitDateFilter = lancamentoSearchSchema.safeParse({ tipo: 'saida', dataRegistro: '2026-09-02' });
		const exitFilters = lancamentoSearchSchema.safeParse({ tipo: 'saida', depositado: 'false' });
		const cursor = lancamentoSearchSchema.safeParse({ cursor: 'abc' });

		expect(entryFilters).toMatchObject({
			success: true,
			data: { dataInicio: '2026-01-01', dataRegistro: '2026-09-02', contraparte: 'Ana', depositado: true },
		});
		expect(allTypesDateFilter).toMatchObject({
			success: true,
			data: { tipo: 'todos', dataRegistro: '2026-09-02' },
		});
		expect(exitDateFilter).toMatchObject({ success: true, data: { tipo: 'saida', dataRegistro: '2026-09-02' } });
		expect(getFieldErrors(exitFilters)?.depositado).toEqual(['Filtro incompatível com o tipo selecionado.']);
		expect(cursor.success).toBe(false);
	});

	it('rejects inverted date ranges and normalizes empty search fields', () => {
		const range = lancamentoSearchSchema.safeParse({ dataInicio: '2026-09-03', dataFim: '2026-09-02' });
		const empty = estornoSearchSchema.safeParse({ descricao: '  ', contraparte: '  ' });
		const obsolete = estornoSearchSchema.safeParse({ cursor: 'abc' });

		expect(getFieldErrors(range)?.dataFim).toEqual(['O início não pode ser posterior ao fim.']);
		expect(empty).toMatchObject({ success: true, data: { tipo: 'todos', descricao: null, contraparte: null } });
		expect(obsolete.success).toBe(false);
	});

	it('validates reversal search periods and reason boundaries', () => {
		const periods = estornoSearchSchema.safeParse({
			contraparte: '  Ana  ',
			lancamentoInicio: '2026-09-03',
			lancamentoFim: '2026-09-02',
			estornoInicio: '2026-09-04',
			estornoFim: '2026-09-03',
		});
		const emptyReason = estornoReasonSchema.safeParse('   ');
		const reason = estornoReasonSchema.safeParse('  Contraparte incorreta  ');
		const normalized = estornoSearchSchema.safeParse({ contraparte: '  Ana  ' });

		expect(getFieldErrors(periods)).toMatchObject({
			lancamentoFim: ['O início não pode ser posterior ao fim.'],
			estornoFim: ['O início não pode ser posterior ao fim.'],
		});
		expect(normalized).toMatchObject({ success: true, data: { contraparte: 'Ana' } });
		expect(emptyReason.success).toBe(false);
		expect(reason).toMatchObject({ success: true, data: 'Contraparte incorreta' });
	});

	it('normalizes and deduplicates deposit selections', () => {
		const ids = depositIdsSchema.safeParse(['7', '7', '8']);
		const object = confirmDepositsSchema.safeParse({ ids: ['9'] });
		const empty = depositIdsSchema.safeParse([]);

		expect(ids).toMatchObject({ success: true, data: [7, 8] });
		expect(object).toMatchObject({ success: true, data: { ids: [9] } });
		expect(empty.success).toBe(false);
	});
});
