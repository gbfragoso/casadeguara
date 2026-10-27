import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTalkProgramHandler } from '#lib/server/comunicacao/palestras/program-handler.js';
import type { PalestraModel } from '#lib/server/models/palestra.js';
import type { GeneratedSheet } from '#lib/server/pdf/sheet/document.js';
import type { ProgramTalkSource } from '#lib/server/pdf/talk-program/content.js';
import { COORDINATOR, VOLUNTEER } from './board-fakes';

const TODAY = '2026-10-27';
const NOVEMBER = { key: '2026-11', year: 2026, month: 11 };
const pdf: GeneratedSheet = { bytes: new Uint8Array([37, 80, 68, 70]), pageCount: 1 };

const readyTalk: ProgramTalkSource = {
	id: 412,
	data: '2026-11-02',
	horario: '08:45',
	titulo: 'Ninguém pode ver o reino de Deus se não nascer de novo',
	observacoes: '(Cap. IV)',
	local: null,
	palestrante: { nome: 'Alcione Soledade' },
};

const createFakes = (talks: ProgramTalkSource[] = [readyTalk]) => ({
	talks: { listMonthProgram: vi.fn<PalestraModel['listMonthProgram']>(async () => talks) },
	generateProgram: vi.fn(async () => pdf),
	today: vi.fn(() => TODAY),
});

type Fakes = ReturnType<typeof createFakes>;
type ProgramRequest = { roles?: string | null; mes?: string };

const requestProgram = (fakes: Fakes, { roles = VOLUNTEER, mes = NOVEMBER.key }: ProgramRequest = {}) => {
	const user = roles === null ? null : { id: 'user-1', roles };
	const url = new URL(`http://localhost/comunicacao/palestras/programacao?mes=${mes}`);
	return createTalkProgramHandler(fakes)({ locals: { user }, url });
};

describe('talk program handler', () => {
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => undefined);
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => vi.restoreAllMocks());

	it.each([
		[null, 401],
		['secretaria', 403],
	])('TU-14 denies the user with roles %s before reading the month', async (roles, status) => {
		const fakes = createFakes();

		const response = await requestProgram(fakes, { roles });

		expect(response.status).toBe(status);
		expect(fakes.today).not.toHaveBeenCalled();
		expect(fakes.talks.listMonthProgram).not.toHaveBeenCalled();
	});

	it.each(['2026-09', '2026-12'])('TU-15 rejects the month %s outside the window', async (mes) => {
		const fakes = createFakes();

		const response = await requestProgram(fakes, { mes });

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ message: 'Escolha o mês atual ou o próximo.', pendencias: [] });
		expect(fakes.talks.listMonthProgram).not.toHaveBeenCalled();
	});

	it('TU-16 blocks a month with pending talks without generating', async () => {
		const fakes = createFakes([readyTalk, { ...readyTalk, id: 507, data: '2026-11-07', palestrante: null }]);

		const response = await requestProgram(fakes);

		expect(response.status).toBe(422);
		expect(await response.json()).toEqual({
			message: 'Complete estas palestras no quadro para gerar a programação:',
			pendencias: [{ id: 507, quando: 'Sábado, 07/11/2026 · 08:45', falta: 'Falta o palestrante.' }],
		});
		expect(fakes.generateProgram).not.toHaveBeenCalled();
		expect(console.warn).toHaveBeenCalledWith('comunicacao.palestras.programacao_bloqueada', {
			mes: NOVEMBER.key,
			motivo: 'pendencias',
			pendencias: 1,
			actorId: 'user-1',
		});
	});

	it('TU-17 blocks an empty month without generating', async () => {
		const fakes = createFakes([]);

		const response = await requestProgram(fakes);

		expect(response.status).toBe(422);
		expect(await response.json()).toEqual({
			message: 'Nenhuma palestra cadastrada em novembro de 2026.',
			pendencias: [],
		});
		expect(fakes.generateProgram).not.toHaveBeenCalled();
	});

	it.each([VOLUNTEER, COORDINATOR])('TU-18 serves the program PDF privately to %s', async (roles) => {
		const fakes = createFakes();

		const response = await requestProgram(fakes, { roles });

		expect(response.status).toBe(200);
		expect(Object.fromEntries(response.headers)).toMatchObject({
			'cache-control': 'private, no-store',
			'content-disposition': 'inline; filename="programacao-palestras-2026-11.pdf"',
			'content-type': 'application/pdf',
			'x-content-type-options': 'nosniff',
		});
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(pdf.bytes);
		expect(fakes.generateProgram).toHaveBeenCalledWith({ month: NOVEMBER, generatedOn: TODAY, talks: [readyTalk] });
	});

	it('TU-18 reads the month range and logs the generation', async () => {
		const fakes = createFakes();

		await requestProgram(fakes);

		expect(fakes.talks.listMonthProgram).toHaveBeenCalledWith({
			firstDay: '2026-11-01',
			nextMonthFirstDay: '2026-12-01',
		});
		expect(console.info).toHaveBeenCalledWith('comunicacao.palestras.programacao_gerada', {
			mes: NOVEMBER.key,
			quantidade: 1,
			paginas: pdf.pageCount,
			bytes: pdf.bytes.byteLength,
			duracaoMs: expect.any(Number),
			actorId: 'user-1',
		});
	});

	it('TU-19 translates a generation failure into a generic 500', async () => {
		const fakes = createFakes();
		const cause = new Error('pdf-lib failed');
		fakes.generateProgram.mockRejectedValue(cause);

		const response = await requestProgram(fakes);

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			message: 'Não foi possível gerar a programação. Tente novamente.',
			pendencias: [],
		});
		expect(console.error).toHaveBeenCalledWith('comunicacao.palestras.falha', {
			operacao: 'gerar_programacao',
			mes: NOVEMBER.key,
			error: cause,
		});
	});
});
