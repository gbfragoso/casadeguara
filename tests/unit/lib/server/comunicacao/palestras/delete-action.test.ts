import { describe, expect, it } from 'vitest';

import { expectHttpError, runHandler } from '../../../../support/handler-event';
import { COORDINATOR, createBoard, createFakeTalks, VOLUNTEER } from './board-fakes';

describe('talk board delete action', () => {
	it('TU-16 forbids a volunteer before reading the body', async () => {
		const talks = createFakeTalks();

		const { event, error } = await expectHttpError(createBoard(talks).actions.excluir, {
			roles: VOLUNTEER,
			form: { id: '31' },
		});

		expect(error.status).toBe(403);
		expect(event.request.bodyUsed).toBe(false);
		expect(talks.remove).not.toHaveBeenCalled();
	});

	it('TU-16 deletes a talk for the coordination', async () => {
		const talks = createFakeTalks();

		const { result } = await runHandler(createBoard(talks).actions.excluir, {
			roles: COORDINATOR,
			form: { id: '31' },
		});

		expect(result).toEqual({ operacao: 'excluir', palestraId: 31 });
		expect(talks.remove).toHaveBeenCalledWith(31);
	});

	it('reports a talk already deleted', async () => {
		const talks = createFakeTalks();
		talks.remove.mockResolvedValue(false);

		const { result } = await runHandler(createBoard(talks).actions.excluir, {
			roles: COORDINATOR,
			form: { id: '31' },
		});

		expect(result).toMatchObject({
			status: 404,
			data: { operacao: 'excluir', codigo: 'inexistente', palestraId: 31 },
		});
	});

	it('rejects a malformed id', async () => {
		const talks = createFakeTalks();

		const { result } = await runHandler(createBoard(talks).actions.excluir, {
			roles: COORDINATOR,
			form: { id: 'x' },
		});

		expect(result).toMatchObject({ status: 400, data: { codigo: 'validacao', campo: 'id' } });
		expect(talks.remove).not.toHaveBeenCalled();
	});
});
