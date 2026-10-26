import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSpeakerImportHandlers } from '#lib/server/comunicacao/palestrantes/import.js';
import { expectHttpError, expectRedirect, runHandler } from '../../../../support/handler-event';
import { createFakeSpeakers, SPEAKER_ID, VOLUNTEER } from './speaker-fakes';

const IMPORT_URL = 'http://localhost/comunicacao/palestrantes/importar';
const importAction = (speakers = createFakeSpeakers()) => createSpeakerImportHandlers({ speakers }).actions.importar;

describe('speaker import search', () => {
	afterEach(() => vi.restoreAllMocks());

	it('searches the Secretaria registrations by the normalized term', async () => {
		const speakers = createFakeSpeakers();
		const candidate = { cadastroId: 812, nome: 'Carmélia Amorim', temFoto: true, palestranteId: null };
		speakers.searchImportCandidates.mockResolvedValue([candidate]);

		const { result } = await runHandler(createSpeakerImportHandlers({ speakers }).load, {
			roles: VOLUNTEER,
			url: `${IMPORT_URL}?nome=Carm%C3%A9lia`,
		});

		expect(speakers.searchImportCandidates).toHaveBeenCalledWith('carmelia');
		expect(result).toEqual({ busca: 'Carmélia', candidatos: [candidate] });
	});

	it('does not search before a term is typed', async () => {
		const speakers = createFakeSpeakers();

		const { result } = await runHandler(createSpeakerImportHandlers({ speakers }).load, {
			roles: VOLUNTEER,
			url: IMPORT_URL,
		});

		expect(result).toEqual({ busca: '', candidatos: [] });
		expect(speakers.searchImportCandidates).not.toHaveBeenCalled();
	});

	it('reports a failed search', async () => {
		const speakers = createFakeSpeakers();
		speakers.searchImportCandidates.mockRejectedValue(new Error('database down'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const { error } = await expectHttpError(createSpeakerImportHandlers({ speakers }).load, {
			roles: VOLUNTEER,
			url: `${IMPORT_URL}?nome=ana`,
		});

		expect(error.status).toBe(500);
	});
});

describe('speaker import action', () => {
	afterEach(() => vi.restoreAllMocks());

	it('TU-18 opens the imported speaker page', async () => {
		const speakers = createFakeSpeakers();

		const { redirect } = await expectRedirect(importAction(speakers), {
			roles: VOLUNTEER,
			userId: 'voluntario-1',
			form: { cadastroId: '812' },
		});

		expect(speakers.importFromCadastro).toHaveBeenCalledWith(812, 'voluntario-1');
		expect(redirect).toMatchObject({ status: 303, location: `/comunicacao/palestrantes/${SPEAKER_ID}` });
	});

	it('opens the speaker linked to a homonym', async () => {
		const speakers = createFakeSpeakers();
		speakers.importFromCadastro.mockResolvedValue({ status: 'linked', palestranteId: 9 });

		const { redirect } = await expectRedirect(importAction(speakers), {
			roles: VOLUNTEER,
			form: { cadastroId: '812' },
		});

		expect(redirect).toMatchObject({ status: 303, location: '/comunicacao/palestrantes/9' });
	});

	it.each([
		['already-imported', 409, 'Este cadastro já foi importado.'],
		['missing', 404, 'Cadastro não encontrado.'],
		['duplicate-name', 400, 'Já existe um palestrante com esse nome.'],
	] as const)('TU-18 translates %s', async (status, httpStatus, mensagem) => {
		const speakers = createFakeSpeakers();
		speakers.importFromCadastro.mockResolvedValue({ status });

		const { result } = await runHandler(importAction(speakers), { roles: VOLUNTEER, form: { cadastroId: '812' } });

		expect(result).toMatchObject({ status: httpStatus, data: { mensagem } });
	});

	it('rejects a malformed registration id without calling the model', async () => {
		const speakers = createFakeSpeakers();

		const { result } = await runHandler(importAction(speakers), { roles: VOLUNTEER, form: { cadastroId: 'x' } });

		expect(result).toMatchObject({ status: 400, data: { mensagem: 'Selecione um cadastro válido.' } });
		expect(speakers.importFromCadastro).not.toHaveBeenCalled();
	});

	it('denies a user without a Comunicação role before reading the body', async () => {
		const { event, error } = await expectHttpError(importAction(), {
			roles: 'secretaria',
			form: { cadastroId: '812' },
		});

		expect(error.status).toBe(403);
		expect(event.request.bodyUsed).toBe(false);
	});

	it('reports an unexpected import failure', async () => {
		const speakers = createFakeSpeakers();
		speakers.importFromCadastro.mockRejectedValue(new Error('database down'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const { error } = await expectHttpError(importAction(speakers), {
			roles: VOLUNTEER,
			form: { cadastroId: '812' },
		});

		expect(error.status).toBe(500);
	});
});
