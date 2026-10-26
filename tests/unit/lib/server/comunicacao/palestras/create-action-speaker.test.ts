import { describe, expect, it } from 'vitest';

import { runHandler } from '../../../../support/handler-event';
import { createBoard, createFakeTalks, VOLUNTEER } from './board-fakes';

const validForm = { data: '2026-03-09', horario: '08:45', local: '', reuniaoCom: '' };

describe('talk board create action with content and speaker', () => {
	it('passes the title, the notes and the chosen speaker to the model', async () => {
		const talks = createFakeTalks();
		const form = { ...validForm, titulo: ' A prece ', observacoes: 'Cap. 20', palestranteId: '4' };

		await runHandler(createBoard(talks).actions.criar, { roles: VOLUNTEER, form });

		expect(talks.create).toHaveBeenCalledWith(
			expect.objectContaining({
				titulo: 'A prece',
				observacoes: 'Cap. 20',
				palestranteId: 4,
				novoPalestrante: null,
			}),
			'user-1',
		);
	});

	it('rejects a new speaker name that already exists on the new speaker field', async () => {
		const talks = createFakeTalks();
		talks.create.mockResolvedValue({ status: 'duplicate-speaker' });
		const form = { ...validForm, novoPalestrante: 'Carmélia Amorim' };

		const { result } = await runHandler(createBoard(talks).actions.criar, { roles: VOLUNTEER, form });

		expect(result).toMatchObject({
			status: 400,
			data: { operacao: 'criar', codigo: 'nome-duplicado', campo: 'novoPalestrante' },
		});
	});

	it('rejects a speaker that no longer exists on the speaker field', async () => {
		const talks = createFakeTalks();
		talks.create.mockResolvedValue({ status: 'missing-speaker' });
		const form = { ...validForm, palestranteId: '99' };

		const { result } = await runHandler(createBoard(talks).actions.criar, { roles: VOLUNTEER, form });

		expect(result).toMatchObject({
			status: 400,
			data: { codigo: 'validacao', campo: 'palestranteId', mensagem: 'Palestrante não encontrado.' },
		});
	});
});
