import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CadastroModel } from '#lib/server/models/cadastro.js';
import type { GeneratedSheet } from '#lib/server/pdf/sheet/document.js';
import { createAttendancePdfHandler } from '#lib/server/secretaria/frequencia/pdf-handler.js';

const TODAY = '2026-11-02';
const TITLE = 'Lista de presença';
const VALID_QUERY = `?titulo=${encodeURIComponent(TITLE)}&dataInicio=2026-11-01&dataFim=2026-11-30&dias=1&dias=2&dias=4`;
const NOVEMBER_DATES = [
	'2026-11-02',
	'2026-11-03',
	'2026-11-05',
	'2026-11-09',
	'2026-11-10',
	'2026-11-12',
	'2026-11-16',
	'2026-11-17',
	'2026-11-19',
	'2026-11-23',
	'2026-11-24',
	'2026-11-26',
	'2026-11-30',
];
const pdf: GeneratedSheet = { bytes: new Uint8Array([37, 80, 68, 70]), pageCount: 1 };
const workers = ['ÁDRIA SOUZA', 'ADRIANA LIMA'];

const createFakes = (names: string[] = workers) => ({
	workers: { listAttendanceWorkers: vi.fn<CadastroModel['listAttendanceWorkers']>(async () => names) },
	generateList: vi.fn(async () => pdf),
	today: vi.fn(() => TODAY),
});

type Fakes = ReturnType<typeof createFakes>;
type AttendancePdfRequest = { roles?: string | null; query?: string };

const createUrl = (query: string) => new URL(`http://localhost/secretaria/frequencia/pdf${query}`);

const requestAttendancePdf = (
	fakes: Fakes,
	{ roles = 'secretaria', query = VALID_QUERY }: AttendancePdfRequest = {},
) => {
	const user = roles === null ? null : { id: 'user-1', roles };
	return createAttendancePdfHandler(fakes)({ locals: { user }, url: createUrl(query) });
};

describe('attendance PDF handler', () => {
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => undefined);
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => vi.restoreAllMocks());

	it.each([
		[null, 401, 'Usuário não autenticado.'],
		['comunicacao', 403, 'Usuário não possui acesso ao sistema da secretaria.'],
	])('TU-21 denies the user with roles %s before reading the params', async (roles, status, message) => {
		const fakes = createFakes();
		const user = roles === null ? null : { id: 'user-1', roles };
		const url = createUrl(VALID_QUERY);
		const readParam = vi.spyOn(url.searchParams, 'get');
		const readParams = vi.spyOn(url.searchParams, 'getAll');

		const response = await createAttendancePdfHandler(fakes)({ locals: { user }, url });

		expect(response.status).toBe(status);
		expect(await response.json()).toEqual({ message });
		expect(readParam).not.toHaveBeenCalled();
		expect(readParams).not.toHaveBeenCalled();
		expect(fakes.workers.listAttendanceWorkers).not.toHaveBeenCalled();
	});

	it.each([
		['?dataInicio=2026-11-01&dataFim=2026-11-30&dias=1', 'Informe o título da lista (até 60 caracteres).'],
		['?titulo=Lista&dataInicio=2026-11-30&dataFim=2026-11-01&dias=1', 'Informe um período válido.'],
		[
			'?titulo=Lista&dataInicio=2026-11-01&dataFim=2026-12-31&dias=1&dias=2&dias=4',
			'O período gera 27 datas; o limite é 15 por lista. Reduza o período ou os dias da semana.',
		],
	])('TU-22 rejects "%s" with its first issue without generating', async (query, message) => {
		const fakes = createFakes();

		const response = await requestAttendancePdf(fakes, { query });

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ message });
		expect(fakes.workers.listAttendanceWorkers).not.toHaveBeenCalled();
		expect(fakes.generateList).not.toHaveBeenCalled();
	});

	it('TU-23 answers 422 when no worker is marked', async () => {
		const fakes = createFakes([]);

		const response = await requestAttendancePdf(fakes);

		expect(response.status).toBe(422);
		expect(await response.json()).toEqual({
			message: 'Nenhum trabalhador marcado para a lista de frequência. Marque-os em Cadastros.',
		});
		expect(fakes.generateList).not.toHaveBeenCalled();
		expect(console.warn).toHaveBeenCalledWith('secretaria.frequencia.pdf_vazio', {
			inicio: '2026-11-01',
			fim: '2026-11-30',
		});
	});

	it.each(['secretaria', 'secretaria:admin'])('TU-24 serves the dated PDF privately to %s', async (roles) => {
		const fakes = createFakes();

		const response = await requestAttendancePdf(fakes, { roles });

		expect(response.status).toBe(200);
		expect(Object.fromEntries(response.headers)).toMatchObject({
			'cache-control': 'private, no-store',
			'content-disposition': 'inline; filename="frequencia-2026-11-01-a-2026-11-30.pdf"',
			'content-type': 'application/pdf',
			'x-content-type-options': 'nosniff',
		});
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(pdf.bytes);
		expect(fakes.generateList).toHaveBeenCalledWith({
			title: TITLE,
			dates: NOVEMBER_DATES,
			generatedOn: TODAY,
			workers,
		});
	});

	it('TU-24 logs the generation without names, title or user', async () => {
		const fakes = createFakes();

		await requestAttendancePdf(fakes);

		expect(console.info).toHaveBeenCalledWith('secretaria.frequencia.pdf_gerado', {
			inicio: '2026-11-01',
			fim: '2026-11-30',
			trabalhadores: workers.length,
			datas: NOVEMBER_DATES.length,
			paginas: pdf.pageCount,
			bytes: pdf.bytes.byteLength,
			duracaoMs: expect.any(Number),
		});
		const logged = JSON.stringify(vi.mocked(console.info).mock.calls);
		[...workers, TITLE, 'user-1'].forEach((value) => expect(logged).not.toContain(value));
	});

	it('TU-25 translates a generation failure into a generic 500', async () => {
		const fakes = createFakes();
		const cause = new Error('pdf-lib failed');
		fakes.generateList.mockRejectedValue(cause);

		const response = await requestAttendancePdf(fakes);

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({ message: 'Não foi possível gerar o PDF. Tente novamente.' });
		expect(console.error).toHaveBeenCalledWith('secretaria.frequencia.falha', {
			operacao: 'gerar_pdf',
			inicio: '2026-11-01',
			fim: '2026-11-30',
			error: cause,
		});
	});
});
