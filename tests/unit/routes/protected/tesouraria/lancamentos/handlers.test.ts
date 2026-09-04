import { describe, expect, it, vi } from 'vitest';

import { createLancamentoAuditHandlers } from '$lib/server/tesouraria/lancamentos/audit-handlers';
import { createLancamentoCreateHandlers } from '$lib/server/tesouraria/lancamentos/create-handlers';
import {
	alreadyReversedError,
	notDepositableError,
	notFoundError,
	persistenceError,
	validationError,
} from '$lib/server/tesouraria/lancamentos/errors';
import { createLancamentoListHandlers } from '$lib/server/tesouraria/lancamentos/list-handlers';
import { createLancamentoReversalHandlers } from '$lib/server/tesouraria/lancamentos/reversal-handlers';
import {
	getDomainErrors,
	getEstornoSearchValues,
	getLancamentoErrors,
	getLancamentoFormValues,
	getLancamentoSearchValues,
	getReasonValues,
} from '$lib/server/tesouraria/lancamentos/form';
import { createRequestEvent } from '../../../../../integration/support/request-event';
import { estornoReasonSchema } from '$lib/validation/tesouraria/lancamentos';

const user = { id: 'user', roles: 'tesouraria', username: 'user', name: 'User' };
const admin = { id: 'admin', roles: 'tesouraria:admin', username: 'admin', name: 'Admin' };
const page = { items: [], totais: { entradas: '0', saidas: '0' } };

const eventWithForm = (entries: Record<string, string>, currentUser = user, params: Record<string, string> = {}) => {
	const form = new FormData();
	for (const [key, value] of Object.entries(entries)) form.set(key, value);
	return createRequestEvent({
		locals: { user: currentUser, session: null },
		params,
		request: new Request('http://localhost/', { method: 'POST', body: form }),
		url: new URL('http://localhost/'),
	});
};

const listModel = (overrides: Record<string, unknown> = {}) => ({
	search: vi.fn().mockResolvedValue(page),
	...overrides,
});

const createModel = (overrides: Record<string, unknown> = {}) => ({
	listCounterpartOptions: vi.fn().mockResolvedValue([]),
	create: vi.fn().mockResolvedValue({ id: 3, tipo: 'saida', uuidRecibo: null }),
	...overrides,
});

const reversalModel = (overrides: Record<string, unknown> = {}) => ({
	getForReversal: vi.fn().mockResolvedValue({ id: 3, tipo: 'entrada' }),
	reverse: vi.fn().mockResolvedValue(undefined),
	...overrides,
});

const auditModel = (overrides: Record<string, unknown> = {}) => ({
	searchReversals: vi.fn().mockResolvedValue({ items: [] }),
	...overrides,
});

describe('lancamento form mapping', () => {
	it('normalizes primitive values and maps field/form errors', () => {
		expect(getLancamentoFormValues(null)).toEqual({
			tipo: '',
			contraparteId: '',
			descricao: '',
			valor: '',
			dataLancamento: '',
			depositado: '',
		});
		expect(getLancamentoFormValues({ tipo: 'entrada', contraparteId: 4, depositado: true })).toMatchObject({
			tipo: 'entrada',
			contraparteId: '4',
			depositado: 'true',
		});
		expect(getLancamentoSearchValues({ tipo: 'todos', contraparte: 'Ana' })).toMatchObject({
			tipo: 'todos',
			contraparte: 'Ana',
		});
		expect(getEstornoSearchValues({ tipo: 'saida', estornoFim: 7 })).toMatchObject({
			tipo: 'saida',
			estornoFim: '7',
		});
		expect(getReasonValues({ motivo: 'motivo' })).toEqual({ motivo: 'motivo' });

		const zodError = getReasonValues({});
		expect(zodError).toEqual({ motivo: '' });
		expect(getDomainErrors('invalid')).toEqual({ form: ['invalid'] });
		expect(getDomainErrors('invalid', 'motivo')).toEqual({ motivo: ['invalid'] });
		const parsed = estornoReasonSchema.safeParse('');
		if (parsed.success) throw new Error('expected an invalid reason');
		expect(getLancamentoErrors(parsed.error)).toEqual({});
		expect(getLancamentoErrors(parsed.error, ['extra'])).toMatchObject({ form: ['extra'] });
	});
});

describe('list handlers', () => {
	it('rejects invalid load query before model calls', async () => {
		const model = listModel();
		await expect(
			createLancamentoListHandlers({ model }).load(
				createRequestEvent({ locals: { user, session: null }, url: new URL('http://localhost/?unknown=x') }),
			),
		).rejects.toMatchObject({ status: 400 });
		expect(model.search).not.toHaveBeenCalled();
	});

	it.each([validationError('filtro inválido'), notFoundError()])('maps load model errors', async (cause) => {
		const model = listModel({ search: vi.fn().mockRejectedValue(cause) });
		await expect(
			createLancamentoListHandlers({ model }).load(createRequestEvent({ locals: { user, session: null } })),
		).rejects.toMatchObject({ status: cause.code === 'VALIDATION_ERROR' ? 400 : 404 });
	});

	it('sanitizes unknown load failures', async () => {
		const model = listModel({ search: vi.fn().mockRejectedValue(new Error('database secret')) });
		await expect(
			createLancamentoListHandlers({ model }).load(createRequestEvent({ locals: { user, session: null } })),
		).rejects.toMatchObject({ status: 500, body: { message: expect.not.stringContaining('secret') } });
	});

	it.each([validationError('filtro inválido'), notFoundError(), persistenceError()])(
		'maps search model errors',
		async (cause) => {
			const model = listModel({ search: vi.fn().mockRejectedValue(cause) });
			const action = createLancamentoListHandlers({ model }).actions.pesquisar(eventWithForm({ tipo: 'todos' }));
			if (cause.code === 'PERSISTENCE_ERROR') {
				await expect(action).rejects.toMatchObject({ status: 500 });
				return;
			}
			const result = await action;
			expect(result).toMatchObject({ status: cause.code === 'VALIDATION_ERROR' ? 400 : 404 });
		},
	);
});

describe('create handlers', () => {
	it('loads counterpart options and sanitizes option failures', async () => {
		const model = createModel({ listCounterpartOptions: vi.fn().mockResolvedValue([{ id: 2, nome: 'Ana' }]) });
		await expect(createLancamentoCreateHandlers({ model }).load({ locals: { user } })).resolves.toEqual({
			contrapartes: [{ id: 2, nome: 'Ana' }],
		});
		const broken = createModel({ listCounterpartOptions: vi.fn().mockRejectedValue(new Error('secret')) });
		await expect(
			createLancamentoCreateHandlers({ model: broken }).load({ locals: { user } }),
		).rejects.toMatchObject({
			status: 500,
			body: { message: expect.not.stringContaining('secret') },
		});
	});

	it('preserves invalid form values before calling the model', async () => {
		const model = createModel();
		const result = await createLancamentoCreateHandlers({ model }).actions.default(
			eventWithForm({ tipo: 'entrada', descricao: '', valor: 'x', dataLancamento: '' }),
		);
		expect(result).toMatchObject({ status: 400, data: { values: { tipo: 'entrada', valor: 'x' } } });
		expect(model.create).not.toHaveBeenCalled();
	});

	it.each([validationError('Contraparte não encontrada.'), validationError('Forma inválida.'), notFoundError()])(
		'maps model creation errors',
		async (cause) => {
			const model = createModel({ create: vi.fn().mockRejectedValue(cause) });
			const result = await createLancamentoCreateHandlers({ model }).actions.default(
				eventWithForm({
					tipo: 'saida',
					contraparteId: '',
					descricao: 'Material',
					valor: '10',
					dataLancamento: '2026-09-02',
				}),
			);
			expect(result).toMatchObject({ status: cause.code === 'VALIDATION_ERROR' ? 400 : 404 });
		},
	);

	it('sanitizes unknown creation failures and missing receipt identifiers', async () => {
		const model = createModel({ create: vi.fn().mockRejectedValue(new Error('secret')) });
		await expect(
			createLancamentoCreateHandlers({ model }).actions.default(
				eventWithForm({
					tipo: 'saida',
					contraparteId: '',
					descricao: 'Material',
					valor: '10',
					dataLancamento: '2026-09-02',
				}),
			),
		).rejects.toMatchObject({ status: 500, body: { message: expect.not.stringContaining('secret') } });
		const missingReceipt = createModel({
			create: vi.fn().mockResolvedValue({ id: 4, tipo: 'entrada', uuidRecibo: null }),
		});
		await expect(
			createLancamentoCreateHandlers({ model: missingReceipt }).actions.default(
				eventWithForm({
					tipo: 'entrada',
					contraparteId: '2',
					descricao: 'Doação',
					valor: '10',
					dataLancamento: '2026-09-02',
					depositado: 'true',
				}),
			),
		).rejects.toMatchObject({ status: 500 });
	});
});

describe('reversal handlers', () => {
	it('returns forbidden for non-administrators before loading a reversal', async () => {
		await expect(
			createLancamentoReversalHandlers({ model: reversalModel() }).load(
				createRequestEvent({ locals: { user, session: null }, params: { id: '4' } }),
			),
		).rejects.toMatchObject({ status: 403 });
	});

	it('covers reversal load not-found and sanitized failures', async () => {
		await expect(
			createLancamentoReversalHandlers({ model: reversalModel() }).load(
				createRequestEvent({ locals: { user: admin, session: null }, params: { id: 'x' } }),
			),
		).rejects.toMatchObject({ status: 404 });
		const missing = reversalModel({ getForReversal: vi.fn().mockResolvedValue(null) });
		await expect(
			createLancamentoReversalHandlers({ model: missing }).load(
				createRequestEvent({ locals: { user: admin, session: null }, params: { id: '4' } }),
			),
		).rejects.toMatchObject({ status: 404 });
		const notFound = reversalModel({ getForReversal: vi.fn().mockRejectedValue(notFoundError()) });
		await expect(
			createLancamentoReversalHandlers({ model: notFound }).load(
				createRequestEvent({ locals: { user: admin, session: null }, params: { id: '4' } }),
			),
		).rejects.toMatchObject({ status: 404 });
		const broken = reversalModel({ getForReversal: vi.fn().mockRejectedValue(new Error('secret')) });
		await expect(
			createLancamentoReversalHandlers({ model: broken }).load(
				createRequestEvent({ locals: { user: admin, session: null }, params: { id: '4' } }),
			),
		).rejects.toMatchObject({ status: 500, body: { message: expect.not.stringContaining('secret') } });
	});

	it('rejects invalid action ids before reading the request', async () => {
		const model = reversalModel();
		const event = eventWithForm({ motivo: 'motivo' }, admin, { id: '0' });
		const readRequest = vi.spyOn(event.request, 'formData');
		const result = await createLancamentoReversalHandlers({ model }).actions.default(event);
		expect(result).toMatchObject({ status: 404 });
		expect(readRequest).not.toHaveBeenCalled();
	});

	it.each([
		validationError('motivo inválido'),
		notFoundError(),
		alreadyReversedError(),
		notDepositableError(),
		persistenceError(),
	])('maps reversal model errors', async (cause) => {
		const model = reversalModel({ reverse: vi.fn().mockRejectedValue(cause) });
		const status =
			cause.code === 'VALIDATION_ERROR'
				? 400
				: cause.code === 'LANCAMENTO_NOT_FOUND'
					? 404
					: ['LANCAMENTO_ALREADY_REVERSED', 'LANCAMENTO_NOT_DEPOSITABLE'].includes(cause.code)
						? 409
						: 500;
		const action = createLancamentoReversalHandlers({ model }).actions.default(
			eventWithForm({ motivo: 'motivo' }, admin, { id: '4' }),
		);
		if (status === 500) await expect(action).rejects.toMatchObject({ status });
		else expect(await action).toMatchObject({ status });
	});
});

describe('audit handlers', () => {
	it('returns forbidden for non-administrators before reading audit requests', async () => {
		const event = eventWithForm({ tipo: 'todos' }, user);
		const readRequest = vi.spyOn(event.request, 'formData');
		await expect(
			createLancamentoAuditHandlers({ model: auditModel() }).actions.pesquisar(event),
		).rejects.toMatchObject({
			status: 403,
		});
		expect(readRequest).not.toHaveBeenCalled();
	});

	it('rejects invalid load filters before querying', async () => {
		const model = auditModel();
		await expect(
			createLancamentoAuditHandlers({ model }).load(
				createRequestEvent({
					locals: { user: admin, session: null },
					url: new URL('http://localhost/?unknown=x'),
				}),
			),
		).rejects.toMatchObject({ status: 400 });
		expect(model.searchReversals).not.toHaveBeenCalled();
	});

	it('loads audit rows and maps model failures for load and search', async () => {
		const listCounterpartOptions = vi.fn().mockResolvedValue([{ id: 1, nome: 'Ana' }]);
		const model = auditModel({ listCounterpartOptions });
		const result = await createLancamentoAuditHandlers({ model }).load(
			createRequestEvent({ locals: { user: admin, session: null } }),
		);
		expect(result).toMatchObject({ page: { items: [] }, isAdmin: true });
		expect(listCounterpartOptions).not.toHaveBeenCalled();
		const validation = auditModel({ searchReversals: vi.fn().mockRejectedValue(validationError('invalid')) });
		await expect(
			createLancamentoAuditHandlers({ model: validation }).load(
				createRequestEvent({ locals: { user: admin, session: null } }),
			),
		).rejects.toMatchObject({ status: 400 });
		const broken = auditModel({ searchReversals: vi.fn().mockRejectedValue(new Error('secret')) });
		await expect(
			createLancamentoAuditHandlers({ model: broken }).actions.pesquisar(eventWithForm({ tipo: 'todos' }, admin)),
		).rejects.toMatchObject({ status: 500, body: { message: expect.not.stringContaining('secret') } });
		const actionValidation = auditModel({ searchReversals: vi.fn().mockRejectedValue(validationError('invalid')) });
		expect(
			await createLancamentoAuditHandlers({ model: actionValidation }).actions.pesquisar(
				eventWithForm({ tipo: 'todos' }, admin),
			),
		).toMatchObject({ status: 400 });
		const brokenLoad = auditModel({ searchReversals: vi.fn().mockRejectedValue(new Error('secret')) });
		await expect(
			createLancamentoAuditHandlers({ model: brokenLoad }).load(
				createRequestEvent({ locals: { user: admin, session: null } }),
			),
		).rejects.toMatchObject({ status: 500 });
	});

	it('preserves invalid audit form values', async () => {
		const result = await createLancamentoAuditHandlers({ model: auditModel() }).actions.pesquisar(
			eventWithForm({ tipo: 'entrada', lancamentoInicio: '2026-09-03', lancamentoFim: '2026-09-01' }, admin),
		);
		expect(result).toMatchObject({ status: 400, data: { values: { tipo: 'entrada' } } });
	});
});
