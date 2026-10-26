import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSpeakerEditHandlers } from '#lib/server/comunicacao/palestrantes/edit.js';
import { DuplicatePalestranteNameError } from '#lib/server/models/palestrante-error.js';
import { expectHttpError, expectRedirect, runHandler } from '../../../../support/handler-event';
import { COORDINATOR, createFakeSpeakers, SPEAKER, SPEAKER_ID, VOLUNTEER } from './speaker-fakes';

const params = { id: `${SPEAKER_ID}` };
const handlers = (speakers = createFakeSpeakers()) => createSpeakerEditHandlers({ speakers });

describe('speaker page load', () => {
	it('gives the volunteer the speaker without coordination rights', async () => {
		const { result } = await runHandler(handlers().load, { roles: VOLUNTEER, params });

		expect(result).toEqual({ palestrante: SPEAKER, isAdmin: false });
	});

	it('flags the coordination', async () => {
		const { result } = await runHandler(handlers().load, { roles: COORDINATOR, params });

		expect(result).toMatchObject({ isAdmin: true });
	});

	it('answers 404 for an unknown speaker', async () => {
		const speakers = createFakeSpeakers();
		speakers.get.mockResolvedValue(undefined);

		const { error } = await expectHttpError(handlers(speakers).load, { roles: VOLUNTEER, params });

		expect(error.status).toBe(404);
	});
});

describe('speaker rename action', () => {
	afterEach(() => vi.restoreAllMocks());

	it('renames the speaker for the current user', async () => {
		const speakers = createFakeSpeakers();

		const { result } = await runHandler(handlers(speakers).actions.salvar, {
			roles: VOLUNTEER,
			userId: 'voluntario-1',
			params,
			form: { nome: ' Carmélia A. Amorim ' },
		});

		expect(result).toEqual({ status: 200 });
		expect(speakers.rename).toHaveBeenCalledWith(SPEAKER_ID, 'Carmélia A. Amorim', 'voluntario-1');
	});

	it('rejects a name already used by another speaker', async () => {
		const speakers = createFakeSpeakers();
		speakers.rename.mockRejectedValue(new DuplicatePalestranteNameError());

		const { result } = await runHandler(handlers(speakers).actions.salvar, {
			roles: VOLUNTEER,
			params,
			form: { nome: 'Paulo' },
		});

		expect(result).toMatchObject({
			status: 400,
			data: { errors: { nome: ['Já existe um palestrante com esse nome.'] } },
		});
	});

	it('rejects a name longer than 60 characters without calling the model', async () => {
		const speakers = createFakeSpeakers();

		const { result } = await runHandler(handlers(speakers).actions.salvar, {
			roles: VOLUNTEER,
			params,
			form: { nome: 'a'.repeat(61) },
		});

		expect(result).toMatchObject({ status: 400, data: { errors: { nome: [expect.stringContaining('60')] } } });
		expect(speakers.rename).not.toHaveBeenCalled();
	});

	it('answers 404 when the speaker was deleted meanwhile', async () => {
		const speakers = createFakeSpeakers();
		speakers.rename.mockResolvedValue(false);

		const { error } = await expectHttpError(handlers(speakers).actions.salvar, {
			roles: VOLUNTEER,
			params,
			form: { nome: 'Ana' },
		});

		expect(error.status).toBe(404);
	});

	it('reports an unexpected rename failure', async () => {
		const speakers = createFakeSpeakers();
		speakers.rename.mockRejectedValue(new Error('database down'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const { error } = await expectHttpError(handlers(speakers).actions.salvar, {
			roles: VOLUNTEER,
			params,
			form: { nome: 'Ana' },
		});

		expect(error.status).toBe(500);
	});
});

describe('speaker delete action', () => {
	afterEach(() => vi.restoreAllMocks());

	it('TU-17 forbids the volunteer before reading the body', async () => {
		const speakers = createFakeSpeakers();

		const { event, error } = await expectHttpError(handlers(speakers).actions.excluir, {
			roles: VOLUNTEER,
			params,
		});

		expect(error.status).toBe(403);
		expect(event.request.bodyUsed).toBe(false);
		expect(speakers.remove).not.toHaveBeenCalled();
	});

	it('TU-17 refuses to delete a speaker used by 3 talks', async () => {
		const speakers = createFakeSpeakers();
		speakers.remove.mockResolvedValue({ status: 'in-use', palestras: 3 });

		const { result } = await runHandler(handlers(speakers).actions.excluir, { roles: COORDINATOR, params });

		expect(result).toMatchObject({
			status: 400,
			data: { mensagem: 'Este palestrante está em 3 palestras e não pode ser excluído.' },
		});
	});

	it('uses the singular for a speaker used by one talk', async () => {
		const speakers = createFakeSpeakers();
		speakers.remove.mockResolvedValue({ status: 'in-use', palestras: 1 });

		const { result } = await runHandler(handlers(speakers).actions.excluir, { roles: COORDINATOR, params });

		expect(result).toMatchObject({
			data: { mensagem: 'Este palestrante está em 1 palestra e não pode ser excluído.' },
		});
	});

	it('returns to the speaker list after deleting', async () => {
		const speakers = createFakeSpeakers();

		const { redirect } = await expectRedirect(handlers(speakers).actions.excluir, { roles: COORDINATOR, params });

		expect(speakers.remove).toHaveBeenCalledWith(SPEAKER_ID);
		expect(redirect).toMatchObject({ status: 303, location: '/comunicacao/palestrantes' });
	});

	it('answers 404 for a speaker already deleted', async () => {
		const speakers = createFakeSpeakers();
		speakers.remove.mockResolvedValue({ status: 'missing' });

		const { error } = await expectHttpError(handlers(speakers).actions.excluir, { roles: COORDINATOR, params });

		expect(error.status).toBe(404);
	});

	it('reports an unexpected deletion failure', async () => {
		const speakers = createFakeSpeakers();
		speakers.remove.mockRejectedValue(new Error('database down'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const { error } = await expectHttpError(handlers(speakers).actions.excluir, { roles: COORDINATOR, params });

		expect(error.status).toBe(500);
	});
});
