import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSpeakerCreateHandlers } from '#lib/server/comunicacao/palestrantes/create.js';
import { DuplicatePalestranteNameError } from '#lib/server/models/palestrante-error.js';
import { expectHttpError, expectRedirect, runHandler } from '../../../../support/handler-event';
import { createFakeSpeakers, SPEAKER_ID, VOLUNTEER } from './speaker-fakes';

const create = (speakers = createFakeSpeakers()) => createSpeakerCreateHandlers({ speakers }).actions.default;

describe('speaker creation', () => {
	afterEach(() => vi.restoreAllMocks());

	it('opens the new speaker page after creating it', async () => {
		const speakers = createFakeSpeakers();

		const { redirect } = await expectRedirect(create(speakers), {
			roles: VOLUNTEER,
			userId: 'voluntario-1',
			form: { nome: '  Carmélia Amorim ' },
		});

		expect(speakers.create).toHaveBeenCalledWith('Carmélia Amorim', 'voluntario-1');
		expect(redirect).toMatchObject({ status: 303, location: `/comunicacao/palestrantes/${SPEAKER_ID}` });
	});

	it('TU-17 rejects a duplicate name with the field message', async () => {
		const speakers = createFakeSpeakers();
		speakers.create.mockRejectedValue(new DuplicatePalestranteNameError());

		const { result } = await runHandler(create(speakers), { roles: VOLUNTEER, form: { nome: 'carmelia amorim' } });

		expect(result).toMatchObject({
			status: 400,
			data: {
				values: { nome: 'carmelia amorim' },
				errors: { nome: ['Já existe um palestrante com esse nome.'] },
			},
		});
	});

	it('rejects a blank name without calling the model', async () => {
		const speakers = createFakeSpeakers();

		const { result } = await runHandler(create(speakers), { roles: VOLUNTEER, form: { nome: '  ' } });

		expect(result).toMatchObject({ status: 400, data: { errors: { nome: ['Informe o nome do palestrante.'] } } });
		expect(speakers.create).not.toHaveBeenCalled();
	});

	it('denies a user without a Comunicação role before reading the body', async () => {
		const { event, error } = await expectHttpError(create(), { roles: 'biblioteca', form: { nome: 'Ana' } });

		expect(error.status).toBe(403);
		expect(event.request.bodyUsed).toBe(false);
	});

	it('reports an unexpected persistence failure', async () => {
		const speakers = createFakeSpeakers();
		speakers.create.mockRejectedValue(new Error('database down'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const { error } = await expectHttpError(create(speakers), { roles: VOLUNTEER, form: { nome: 'Ana' } });

		expect(error.status).toBe(500);
	});

	it('guards the creation page', async () => {
		const { error } = await expectHttpError(createSpeakerCreateHandlers({ speakers: createFakeSpeakers() }).load, {
			roles: 'tesouraria',
		});

		expect(error.status).toBe(403);
	});
});
