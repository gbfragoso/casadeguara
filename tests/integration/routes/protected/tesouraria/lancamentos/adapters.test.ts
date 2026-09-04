import { describe, expect, it, vi } from 'vitest';

import { alreadyReversedError, LancamentoError } from '$lib/server/tesouraria/lancamentos/errors';
import { createLancamentoAuditHandlers } from '$lib/server/tesouraria/lancamentos/audit-handlers';
import { createLancamentoCreateHandlers } from '$lib/server/tesouraria/lancamentos/create-handlers';
import { createLancamentoListHandlers } from '$lib/server/tesouraria/lancamentos/list-handlers';
import { createLancamentoReversalHandlers } from '$lib/server/tesouraria/lancamentos/reversal-handlers';
import { createRequestEvent } from '../../../../support/request-event';
import {
	actions as listRouteActions,
	load as listRouteLoad,
} from '../../../../../../src/routes/(protected)/tesouraria/lancamentos/+page.server';
import {
	actions as createRouteActions,
	load as createRouteLoad,
} from '../../../../../../src/routes/(protected)/tesouraria/lancamentos/novo/+page.server';
import {
	actions as reversalRouteActions,
	load as reversalRouteLoad,
} from '../../../../../../src/routes/(protected)/tesouraria/lancamentos/[id=integer]/estorno/+page.server';
import {
	actions as auditRouteActions,
	load as auditRouteLoad,
} from '../../../../../../src/routes/(protected)/tesouraria/estornos/+page.server';
import { load as treasuryLayoutLoad } from '../../../../../../src/routes/(protected)/tesouraria/+layout.server';

type ListModel = Parameters<typeof createLancamentoListHandlers>[0]['model'];
type CreateModel = Parameters<typeof createLancamentoCreateHandlers>[0]['model'];
type ReversalModel = Parameters<typeof createLancamentoReversalHandlers>[0]['model'];
type AuditModel = Parameters<typeof createLancamentoAuditHandlers>[0]['model'];

const user = { id: 'tesouraria-user', roles: 'tesouraria', username: 'tesouraria', name: 'Tesouraria' };
const admin = { id: 'tesouraria-admin', roles: 'tesouraria:admin', username: 'admin', name: 'Admin' };
const page = { items: [], totais: { entradas: '0', saidas: '0' } };
const formEvent = (entries: Record<string, string>, currentUser = user, params: Record<string, string> = {}) => {
	const form = new FormData();
	Object.entries(entries).forEach(([key, value]) => form.set(key, value));
	return createRequestEvent({
		locals: { user: currentUser, session: null },
		params,
		request: new Request('http://localhost/', { method: 'POST', body: form }),
		url: new URL('http://localhost/'),
	});
};

const createListModel = (overrides: Partial<ListModel> = {}): ListModel => ({
	search: vi.fn().mockResolvedValue(page),
	...overrides,
});

const createCreateModel = (overrides: Partial<CreateModel> = {}): CreateModel => ({
	listCounterpartOptions: vi.fn().mockResolvedValue([]),
	create: vi.fn().mockResolvedValue({ id: 8, tipo: 'saida', uuidRecibo: null, dataRegistro: null }),
	...overrides,
});

const createReversalModel = (overrides: Partial<ReversalModel> = {}): ReversalModel => ({
	getForReversal: vi.fn().mockResolvedValue({ id: 4, tipo: 'entrada' }),
	reverse: vi.fn().mockResolvedValue(undefined),
	...overrides,
});

const createAuditModel = (overrides: Partial<AuditModel> = {}): AuditModel => ({
	searchReversals: vi.fn().mockResolvedValue({ items: [] }),
	...overrides,
});

describe('tesouraria lancamento adapters', () => {
	it('wires protected routes through the domain factories', () => {
		expect([listRouteLoad, createRouteLoad, reversalRouteLoad, auditRouteLoad, treasuryLayoutLoad]).toEqual(
			expect.arrayContaining([expect.any(Function)]),
		);
		expect([
			listRouteActions.pesquisar,
			createRouteActions.default,
			reversalRouteActions.default,
			auditRouteActions.pesquisar,
		]).toEqual(expect.arrayContaining([expect.any(Function)]));
	});
	it('authorizes list searches before reading the request or model', async () => {
		const model = createListModel();
		const requireAccess = vi.fn(() => {
			throw new Error('forbidden');
		});
		const event = formEvent({ tipo: 'todos' });
		const readRequest = vi.spyOn(event.request, 'formData');

		await expect(createLancamentoListHandlers({ model, requireAccess }).actions.pesquisar(event)).rejects.toThrow(
			'forbidden',
		);
		expect(readRequest).not.toHaveBeenCalled();
		expect(model.search).not.toHaveBeenCalled();
	});

	it('preserves safe values and rejects invalid conditional list filters', async () => {
		const model = createListModel();
		const form = formEvent({ tipo: 'saida', depositado: 'false', descricao: '  saída  ' });
		const result = await createLancamentoListHandlers({ model }).actions.pesquisar(form);

		expect(result).toMatchObject({
			status: 400,
			data: { values: { tipo: 'saida', depositado: 'false', descricao: '  saída  ' } },
		});
		expect(model.search).not.toHaveBeenCalled();
	});

	it('loads filtered active results without counterpart options', async () => {
		const model = createListModel();
		const event = createRequestEvent({
			locals: { user, session: null },
			url: new URL('http://localhost/?tipo=entrada&depositado=true'),
		});

		const result = await createLancamentoListHandlers({ model }).load(event);

		expect(result).toMatchObject({ page });
		expect(result).not.toHaveProperty('contrapartes');
		expect(model.search).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'entrada', depositado: true }));
	});

	it('redirects entries to a receipt and exits to the unified list', async () => {
		const entryModel = createCreateModel({
			create: vi
				.fn()
				.mockResolvedValue({ id: 9, tipo: 'entrada', uuidRecibo: 'receipt-uuid', dataRegistro: null }),
		});
		const entry = formEvent({
			tipo: 'entrada',
			contraparteId: '2',
			descricao: 'Doação',
			valor: '10.00',
			dataLancamento: '2026-09-02',
			depositado: 'true',
		});
		await expect(
			createLancamentoCreateHandlers({ model: entryModel }).actions.default(entry),
		).rejects.toMatchObject({ status: 303, location: '/recibo/receipt-uuid' });

		const exitModel = createCreateModel();
		await expect(
			createLancamentoCreateHandlers({ model: exitModel }).actions.default(
				formEvent({
					tipo: 'saida',
					contraparteId: '',
					descricao: 'Material',
					valor: '10.00',
					dataLancamento: '2026-09-02',
				}),
			),
		).rejects.toMatchObject({ status: 303, location: '/tesouraria/lancamentos?criado=8' });
	});

	it('maps reversal validation, conflicts and success without leaking causes', async () => {
		const invalid = await createLancamentoReversalHandlers({ model: createReversalModel() }).actions.default(
			formEvent({ motivo: '   ' }, admin, { id: '4' }),
		);
		expect(invalid).toMatchObject({ status: 400, data: { errors: { motivo: expect.any(Array) } } });

		const conflict = createReversalModel({ reverse: vi.fn().mockRejectedValue(alreadyReversedError()) });
		const conflictResult = await createLancamentoReversalHandlers({ model: conflict }).actions.default(
			formEvent({ motivo: 'duplicado' }, admin, { id: '4' }),
		);
		expect(conflictResult).toMatchObject({ status: 409, data: { message: expect.any(String) } });

		const success = createReversalModel();
		const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
		await expect(
			createLancamentoReversalHandlers({ model: success }).actions.default(
				formEvent({ motivo: 'correção' }, user, { id: '4' }),
			),
		).resolves.toEqual({ status: 200, message: 'Lançamento estornado com sucesso.' });
		expect(success.reverse).toHaveBeenCalledWith(4, 'correção', user.id);
		expect(info).toHaveBeenCalledWith('treasury.launches.reversed', { id: 4, userId: user.id });
		info.mockRestore();

		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const failing = createReversalModel({ reverse: vi.fn().mockRejectedValue(new Error('secret cause')) });
		await expect(
			createLancamentoReversalHandlers({ model: failing }).actions.default(
				formEvent({ motivo: 'falha' }, admin, { id: '4' }),
			),
		).rejects.toMatchObject({ status: 500 });
		expect(error).toHaveBeenCalledWith('treasury.launches.reverse_failed');
		expect(error.mock.calls.flat()).not.toContain('secret cause');
		error.mockRestore();
	});

	it('requires administration before auditing either launch type', async () => {
		const model = createAuditModel();
		const requireAdminAccess = vi.fn(() => {
			throw new LancamentoError('PERSISTENCE_ERROR', 'forbidden');
		});
		const event = formEvent({ tipo: 'entrada' }, user);
		const readRequest = vi.spyOn(event.request, 'formData');

		await expect(
			createLancamentoAuditHandlers({ model, requireAdminAccess }).actions.pesquisar(event),
		).rejects.toMatchObject({ code: 'PERSISTENCE_ERROR' });
		expect(readRequest).not.toHaveBeenCalled();
		expect(model.searchReversals).not.toHaveBeenCalled();
	});

	it('searches the unified reversal audit with validated filters', async () => {
		const model = createAuditModel();
		const event = formEvent(
			{ tipo: 'saida', contraparte: 'Ana', descricao: 'material', estornoInicio: '2026-09-01' },
			admin,
		);
		const result = await createLancamentoAuditHandlers({ model }).actions.pesquisar(event);

		expect(result).toMatchObject({ page: { items: [] } });
		expect(model.searchReversals).toHaveBeenCalledWith(
			expect.objectContaining({ tipo: 'saida', contraparte: 'Ana', estornoInicio: '2026-09-01' }),
		);
	});
});
