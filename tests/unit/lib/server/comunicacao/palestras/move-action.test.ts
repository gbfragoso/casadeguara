import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectHttpError, runHandler } from '../../../../support/handler-event';
import { createBoard, createFakeTalks, TODAY, VOLUNTEER } from './board-fakes';

const moveForm = { origemId: '31', destinoId: '33', ids: ['31', '32', '33'], versoes: ['3', '1', '2'] };

describe('talk board move action', () => {
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => undefined);
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('TU-15 rejects ids and versions of different lengths without calling the model', async () => {
		const talks = createFakeTalks();
		const form = { ...moveForm, versoes: ['3', '1'] };

		const { result } = await runHandler(createBoard(talks).actions.mover, { roles: VOLUNTEER, form });

		expect(result).toMatchObject({ status: 400, data: { operacao: 'mover', codigo: 'validacao' } });
		expect(talks.move).not.toHaveBeenCalled();
	});

	it('TU-15 forwards the range in order and returns the new slot', async () => {
		const talks = createFakeTalks();

		const { result } = await runHandler(createBoard(talks).actions.mover, { roles: VOLUNTEER, form: moveForm });

		expect(result).toEqual({
			operacao: 'mover',
			palestraId: 31,
			status: 'moved',
			slot: { data: '2026-03-09', horario: '08:45' },
		});
		expect(talks.move).toHaveBeenCalledWith(
			{
				originId: 31,
				targetId: 33,
				range: [
					{ id: 31, versao: 3 },
					{ id: 32, versao: 1 },
					{ id: 33, versao: 2 },
				],
			},
			TODAY,
			'user-1',
		);
	});

	it('TU-15 translates a conflict into 409', async () => {
		const talks = createFakeTalks();
		talks.move.mockResolvedValue({ status: 'conflict' });

		const { result } = await runHandler(createBoard(talks).actions.mover, { roles: VOLUNTEER, form: moveForm });

		expect(result).toMatchObject({
			status: 409,
			data: {
				operacao: 'mover',
				codigo: 'conflito',
				palestraId: 31,
				mensagem: 'Outra pessoa alterou esta programação. O board foi atualizado; confira e tente de novo.',
			},
		});
	});

	it('logs and fails with 500 when the move breaks unexpectedly', async () => {
		const talks = createFakeTalks();
		talks.move.mockRejectedValue(new Error('database offline'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const { error } = await expectHttpError(createBoard(talks).actions.mover, { roles: VOLUNTEER, form: moveForm });

		expect(error.status).toBe(500);
		expect(console.error).toHaveBeenCalledWith(
			'comunicacao.palestras.falha',
			expect.objectContaining({ operacao: 'mover', palestraId: 31 }),
		);
	});
});
