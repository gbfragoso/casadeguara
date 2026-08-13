import { describe, expect, it, vi } from 'vitest';

import { _createNewEditoraHandlers } from '../../../../../../src/routes/(protected)/biblioteca/editoras/novo/+page.server';

const createRequest = (nome?: FormDataEntryValue) => {
	const formData = new FormData();
	if (nome !== undefined) formData.set('nome', nome);

	return new Request('http://localhost', { method: 'POST', body: formData });
};

describe('new publisher handlers', () => {
	it('creates a publisher with the normalized name', async () => {
		const model = { create: vi.fn().mockResolvedValue([]) };

		await expect(
			_createNewEditoraHandlers(model).actions.default({ request: createRequest('  José Olympio  ') }),
		).resolves.toEqual({ status: 201 });
		expect(model.create).toHaveBeenCalledWith('JOSÉ OLYMPIO');
	});

	it('returns flattened errors without creating an invalid publisher', async () => {
		const model = { create: vi.fn() };

		await expect(
			_createNewEditoraHandlers(model).actions.default({ request: createRequest('   ') }),
		).resolves.toEqual({
			status: 400,
			data: { values: { nome: '   ' }, errors: { nome: ['Nome da editora é obrigatório.'] } },
		});
		expect(model.create).not.toHaveBeenCalled();
	});

	it('translates database failures to a server error', async () => {
		const model = { create: vi.fn().mockRejectedValue(new Error('database unavailable')) };

		await expect(
			_createNewEditoraHandlers(model).actions.default({ request: createRequest('Ana') }),
		).rejects.toMatchObject({ status: 500, body: { message: 'Falha ao criar uma nova editora' } });
	});
});
