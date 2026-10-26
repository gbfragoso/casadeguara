import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTalkArtHandler } from '#lib/server/comunicacao/palestras/art-handler.js';
import type { TalkArtSource } from '#lib/server/image/talk-art/content.js';
import type { PalestraModel } from '#lib/server/models/palestra.js';
import { VOLUNTEER } from './board-fakes';

const TALK_ID = 412;
const SAVED_VERSION = 4;
const LEGACY_NOTES_LENGTH = 120;
const png = new Uint8Array([137, 80, 78, 71]);

const readyTalk: TalkArtSource = {
	id: TALK_ID,
	versao: SAVED_VERSION,
	data: '2026-10-26',
	horario: '08:45',
	titulo: 'Ninguém pode ver o meu reino se não nascer de novo',
	observacoes: '(Cap. IV)',
	local: 'Rua Major Dórea, 86, Castália, Itabuna-BA',
	reuniaoCom: ['Estudo do Evangelho'],
	palestrante: { nome: 'Alcione Soledade', foto: null },
};

const createFakes = (source: TalkArtSource | undefined = readyTalk) => ({
	talks: { findArtSource: vi.fn<PalestraModel['findArtSource']>(async () => source) },
	generateArt: vi.fn(async () => png),
});

type Fakes = ReturnType<typeof createFakes>;
type ArtRequest = { roles?: string | null; id?: string; versao?: string };

const requestArt = (
	fakes: Fakes,
	{ roles = VOLUNTEER, id = `${TALK_ID}`, versao = `${SAVED_VERSION}` }: ArtRequest = {},
) => {
	const user = roles === null ? null : { id: 'user-1', roles };
	const url = new URL(`http://localhost/comunicacao/palestras/${id}/arte?versao=${versao}`);
	return createTalkArtHandler(fakes)({ locals: { user }, params: { id }, url });
};

describe('talk art handler', () => {
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => undefined);
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => vi.restoreAllMocks());

	it.each([
		[null, 401],
		['secretaria', 403],
	])('TU-20 denies the user with roles %s before reading the talk', async (roles, status) => {
		const fakes = createFakes();

		const response = await requestArt(fakes, { roles });

		expect(response.status).toBe(status);
		expect(fakes.talks.findArtSource).not.toHaveBeenCalled();
	});

	it.each([
		['invalid version', { versao: 'abc' }, readyTalk, 400, 'Dados inválidos.'],
		['missing talk', {}, undefined, 404, 'Esta palestra não existe mais. O board foi atualizado.'],
		[
			'stale version',
			{ versao: `${SAVED_VERSION - 1}` },
			readyTalk,
			409,
			'Outra pessoa alterou esta programação. O board foi atualizado; confira e tente de novo.',
		],
	])('TU-21 rejects a %s without generating', async (_, request, source, status, message) => {
		const fakes = createFakes();
		fakes.talks.findArtSource.mockResolvedValue(source);

		const response = await requestArt(fakes, request);

		expect(response.status).toBe(status);
		expect(await response.json()).toEqual({ message });
		expect(fakes.generateArt).not.toHaveBeenCalled();
	});

	it('TU-21 logs a stale version as a conflict', async () => {
		const fakes = createFakes();

		await requestArt(fakes, { versao: `${SAVED_VERSION + 1}` });

		expect(console.warn).toHaveBeenCalledWith('comunicacao.palestras.conflito', {
			operacao: 'gerar_arte',
			palestraId: TALK_ID,
			actorId: 'user-1',
		});
	});

	it('TU-22 answers 422 with the readiness message without generating', async () => {
		const fakes = createFakes({ ...readyTalk, observacoes: 'o'.repeat(LEGACY_NOTES_LENGTH) });

		const response = await requestArt(fakes);

		expect(response.status).toBe(422);
		expect(await response.json()).toEqual({
			message: 'As observações estão maiores do que cabe na arte. Encurte-as no card para gerar a arte.',
		});
		expect(fakes.generateArt).not.toHaveBeenCalled();
		expect(console.warn).toHaveBeenCalledWith('comunicacao.palestras.arte_bloqueada', {
			palestraId: TALK_ID,
			actorId: 'user-1',
			motivo: 'observacoes-longas',
		});
	});

	it('TU-23 serves the generated PNG privately', async () => {
		const fakes = createFakes();

		const response = await requestArt(fakes);

		expect(response.status).toBe(200);
		expect(Object.fromEntries(response.headers)).toMatchObject({
			'cache-control': 'private, no-store',
			'content-disposition': 'inline; filename="palestra-2026-10-26-0845.png"',
			'content-type': 'image/png',
			'x-content-type-options': 'nosniff',
		});
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(png);
		expect(fakes.generateArt).toHaveBeenCalledWith(readyTalk);
	});

	it('TU-23 logs the generation with its duration and size', async () => {
		const fakes = createFakes();

		await requestArt(fakes);

		expect(console.info).toHaveBeenCalledWith('comunicacao.palestras.arte_gerada', {
			palestraId: TALK_ID,
			actorId: 'user-1',
			duracaoMs: expect.any(Number),
			bytes: png.byteLength,
		});
	});

	it('TU-24 translates a generation failure into a 500', async () => {
		const fakes = createFakes();
		const cause = new Error('sharp failed');
		fakes.generateArt.mockRejectedValue(cause);

		const response = await requestArt(fakes);

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({ message: 'Não foi possível gerar a arte. Tente novamente.' });
		expect(console.error).toHaveBeenCalledWith('comunicacao.palestras.falha', {
			operacao: 'gerar_arte',
			palestraId: TALK_ID,
			error: cause,
		});
	});
});
