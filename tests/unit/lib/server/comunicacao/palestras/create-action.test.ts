import { afterEach, describe, expect, it, vi } from 'vitest';

import { expectHttpError, runHandler } from '../../../../support/handler-event';
import { COORDINATOR, createBoard, createFakeTalks, TODAY, VOLUNTEER } from './board-fakes';

const validForm = { data: '2026-03-09', horario: '08:45', local: 'Rua Major Dórea, 86' };

describe('talk board create action', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('creates a talk for a volunteer', async () => {
		const talks = createFakeTalks();

		const { result } = await runHandler(createBoard(talks).actions.criar, { roles: VOLUNTEER, form: validForm });

		expect(result).toEqual({ operacao: 'criar', palestraId: 1 });
		expect(talks.create).toHaveBeenCalledWith(validForm, 'user-1');
	});

	it.each([
		['data', 'Informe a data.'],
		['horario', 'Informe o horário.'],
	])('TU-11 rejects a talk without %s before calling the model', async (campo, mensagem) => {
		const talks = createFakeTalks();
		const form = { ...validForm, [campo]: '' };

		const { result } = await runHandler(createBoard(talks).actions.criar, { roles: VOLUNTEER, form });

		expect(result).toMatchObject({
			status: 400,
			data: { operacao: 'criar', codigo: 'validacao', campo, mensagem },
		});
		expect(talks.create).not.toHaveBeenCalled();
	});

	it('TU-12 rejects a past date from a volunteer', async () => {
		const talks = createFakeTalks();
		const form = { ...validForm, data: '2026-02-28' };

		const { result } = await runHandler(createBoard(talks).actions.criar, { roles: VOLUNTEER, form });

		expect(result).toMatchObject({ status: 400, data: { codigo: 'data-passada', campo: 'data' } });
		expect(talks.create).not.toHaveBeenCalled();
	});

	it('TU-12 accepts a past date from the coordination', async () => {
		const talks = createFakeTalks();
		const form = { ...validForm, data: '2026-02-28' };

		const { result } = await runHandler(createBoard(talks).actions.criar, { roles: COORDINATOR, form });

		expect(result).toEqual({ operacao: 'criar', palestraId: 1 });
		expect(talks.create).toHaveBeenCalledWith(form, 'user-1');
	});

	it('accepts today from a volunteer', async () => {
		const talks = createFakeTalks();

		const { result } = await runHandler(createBoard(talks).actions.criar, {
			roles: VOLUNTEER,
			form: { ...validForm, data: TODAY },
		});

		expect(result).toEqual({ operacao: 'criar', palestraId: 1 });
	});

	it('forbids a user without a Comunicação role before reading the body', async () => {
		const talks = createFakeTalks();

		const { event, error } = await expectHttpError(createBoard(talks).actions.criar, {
			roles: 'biblioteca',
			form: validForm,
		});

		expect(error.status).toBe(403);
		expect(event.request.bodyUsed).toBe(false);
		expect(talks.create).not.toHaveBeenCalled();
	});
});
