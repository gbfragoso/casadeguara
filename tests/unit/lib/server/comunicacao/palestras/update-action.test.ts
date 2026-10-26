import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runHandler } from '../../../../support/handler-event';
import { COORDINATOR, createBoard, createFakeTalks, TODAY, VOLUNTEER } from './board-fakes';

const target = { id: '31', versao: '3' };

const submitUpdate = (talks: ReturnType<typeof createFakeTalks>, form: Record<string, string>, roles = VOLUNTEER) =>
	runHandler(createBoard(talks).actions.atualizar, { roles, form: { ...target, ...form } });

describe('talk board update action', () => {
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => undefined);
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('TU-12 rejects a past date from a volunteer without calling the model', async () => {
		const talks = createFakeTalks();

		const { result } = await submitUpdate(talks, { campo: 'data', valor: '2026-02-27' });

		expect(result).toMatchObject({ status: 400, data: { codigo: 'data-passada', palestraId: 31, campo: 'data' } });
		expect(talks.update).not.toHaveBeenCalled();
	});

	it('TU-12 lets the coordination use a past date', async () => {
		const talks = createFakeTalks();

		const { result } = await submitUpdate(talks, { campo: 'data', valor: '2026-02-27' }, COORDINATOR);

		expect(result).toEqual({ operacao: 'atualizar', palestraId: 31, versao: 2 });
		expect(talks.update).toHaveBeenCalledWith(
			{ id: 31, versao: 3 },
			{ campo: 'data', valor: '2026-02-27' },
			{ today: TODAY, allowPast: true },
			'user-1',
		);
	});

	it('TU-13 saves a title and returns the new version', async () => {
		const talks = createFakeTalks();

		const { result } = await submitUpdate(talks, { campo: 'titulo', valor: '  A prece  ' });

		expect(result).toEqual({ operacao: 'atualizar', palestraId: 31, versao: 2 });
		expect(talks.update).toHaveBeenCalledWith(
			{ id: 31, versao: 3 },
			{ campo: 'titulo', valor: 'A prece' },
			{ today: TODAY, allowPast: false },
			'user-1',
		);
	});

	it.each([
		['locked', 403, 'historico-bloqueado'],
		['conflict', 409, 'conflito'],
		['missing', 404, 'inexistente'],
	] as const)('TU-13 translates %s into %i %s', async (status, httpStatus, codigo) => {
		const talks = createFakeTalks();
		talks.update.mockResolvedValue({ status });

		const { result } = await submitUpdate(talks, { campo: 'local', valor: 'Sede' });

		expect(result).toMatchObject({ status: httpStatus, data: { operacao: 'atualizar', codigo, palestraId: 31 } });
	});

	it('TU-14 creates and associates a new speaker', async () => {
		const talks = createFakeTalks();

		const { result } = await submitUpdate(talks, { campo: 'novoPalestrante', valor: 'Carmélia Amorim' });

		expect(result).toEqual({ operacao: 'atualizar', palestraId: 31, versao: 2 });
		expect(talks.update).toHaveBeenCalledWith(
			expect.anything(),
			{ campo: 'novoPalestrante', valor: 'Carmélia Amorim' },
			expect.anything(),
			'user-1',
		);
	});

	it('TU-14 rejects a duplicate speaker name', async () => {
		const talks = createFakeTalks();
		talks.update.mockResolvedValue({ status: 'duplicate-speaker' });

		const { result } = await submitUpdate(talks, { campo: 'novoPalestrante', valor: 'Carmélia Amorim' });

		expect(result).toMatchObject({ status: 400, data: { codigo: 'nome-duplicado', campo: 'novoPalestrante' } });
	});

	it('rejects a speaker that no longer exists', async () => {
		const talks = createFakeTalks();
		talks.update.mockResolvedValue({ status: 'missing-speaker' });

		const { result } = await submitUpdate(talks, { campo: 'palestranteId', valor: '99' });

		expect(result).toMatchObject({ status: 400, data: { codigo: 'validacao', campo: 'palestranteId' } });
	});

	it('names the edited field when its value is too long', async () => {
		const talks = createFakeTalks();

		const { result } = await submitUpdate(talks, { campo: 'titulo', valor: 'x'.repeat(71) });

		expect(result).toMatchObject({
			status: 400,
			data: { codigo: 'validacao', campo: 'titulo', mensagem: 'O título deve ter até 70 caracteres.' },
		});
		expect(talks.update).not.toHaveBeenCalled();
	});

	it('rejects a malformed version before calling the model', async () => {
		const talks = createFakeTalks();

		const { result } = await submitUpdate(talks, { versao: 'abc', campo: 'titulo', valor: 'A prece' });

		expect(result).toMatchObject({ status: 400, data: { codigo: 'validacao', campo: 'versao' } });
		expect(talks.update).not.toHaveBeenCalled();
	});

	it('logs the update with ids only', async () => {
		const talks = createFakeTalks();

		await submitUpdate(talks, { campo: 'titulo', valor: 'A prece' });

		expect(console.info).toHaveBeenCalledWith('comunicacao.palestras.atualizada', {
			palestraId: 31,
			campo: 'titulo',
			actorId: 'user-1',
			duracaoMs: expect.any(Number),
		});
	});
});
