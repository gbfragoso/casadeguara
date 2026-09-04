import { afterEach, describe, expect, it, vi } from 'vitest';

import { LancamentoError, lancamentoModel } from '$lib/server/tesouraria/lancamentos';
import { load } from '../../../../src/routes/recibo/[uuid=uuid]/+page.server';
import { createRequestEvent, invoke } from '../../support/request-event';

describe('receipt route adapter', () => {
	afterEach(() => vi.restoreAllMocks());

	it('returns the discriminated active and reversed states', async () => {
		const getReceipt = vi.spyOn(lancamentoModel, 'getReceipt');
		getReceipt.mockResolvedValueOnce({
			status: 'ativo',
			entrada: {
				id: 4,
				valor: '10.00',
				descricao: 'Ativa',
				contribuinte: 'Ana',
				dataEntrada: '2026-09-02',
				dataRegistro: '2026-09-02',
			},
		});
		getReceipt.mockResolvedValueOnce({ status: 'estornado', motivo: 'Correção' });

		const active = await invoke(load, createRequestEvent({ params: { uuid: 'active' } }));
		const reversed = await invoke(load, createRequestEvent({ params: { uuid: 'reversed' } }));

		expect(active).toMatchObject({ status: 'ativo', entrada: { id: 4 } });
		expect(reversed).toEqual({ status: 'estornado', motivo: 'Correção' });
	});

	it('maps unknown and invalid receipt lookups to safe HTTP errors', async () => {
		const getReceipt = vi.spyOn(lancamentoModel, 'getReceipt');
		getReceipt.mockResolvedValueOnce(null);
		await expect(invoke(load, createRequestEvent({ params: { uuid: 'missing' } }))).rejects.toMatchObject({
			status: 404,
		});

		getReceipt.mockRejectedValueOnce(new LancamentoError('VALIDATION_ERROR', 'invalid'));
		await expect(invoke(load, createRequestEvent({ params: { uuid: 'invalid' } }))).rejects.toMatchObject({
			status: 400,
		});

		getReceipt.mockRejectedValueOnce(new Error('database failure'));
		await expect(invoke(load, createRequestEvent({ params: { uuid: 'broken' } }))).rejects.toMatchObject({
			status: 500,
		});
	});
});
