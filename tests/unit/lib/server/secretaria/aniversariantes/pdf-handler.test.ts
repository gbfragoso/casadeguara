import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { BirthdaySource } from '#lib/server/models/cadastro-birthdays.js';
import type { CadastroModel } from '#lib/server/models/cadastro.js';
import type { GeneratedSheet } from '#lib/server/pdf/sheet/document.js';
import { createBirthdayPdfHandler } from '#lib/server/secretaria/aniversariantes/pdf-handler.js';

const TODAY = '2026-10-27';
const JANUARY = { key: '2027-01', year: 2027, month: 1 };
const pdf: GeneratedSheet = { bytes: new Uint8Array([37, 80, 68, 70]), pageCount: 1 };
const people: BirthdaySource[] = [
	{ id: 31, nome: 'Maria das Graças', dia: 7, desencarnado: false },
	{ id: 45, nome: 'João Batista', dia: 15, desencarnado: true },
];

const createFakes = (birthdays: BirthdaySource[] = people) => ({
	birthdays: { listMonthBirthdays: vi.fn<CadastroModel['listMonthBirthdays']>(async () => birthdays) },
	generateList: vi.fn(async () => pdf),
	today: vi.fn(() => TODAY),
});

type Fakes = ReturnType<typeof createFakes>;
type BirthdayPdfRequest = { roles?: string | null; query?: string };

const createUrl = (query: string) => new URL(`http://localhost/secretaria/aniversariantes/pdf${query}`);

const requestBirthdayPdf = (fakes: Fakes, { roles = 'secretaria', query = '?mes=01' }: BirthdayPdfRequest = {}) => {
	const user = roles === null ? null : { id: 'user-1', roles };
	return createBirthdayPdfHandler(fakes)({ locals: { user }, url: createUrl(query) });
};

describe('birthday PDF handler', () => {
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => undefined);
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => vi.restoreAllMocks());

	it.each([
		[null, 401, 'Usuário não autenticado.'],
		['comunicacao', 403, 'Usuário não possui acesso ao sistema da secretaria.'],
	])('TU-16 denies the user with roles %s before reading the month', async (roles, status, message) => {
		const fakes = createFakes();
		const user = roles === null ? null : { id: 'user-1', roles };
		const url = createUrl('?mes=01');
		const readParam = vi.spyOn(url.searchParams, 'get');

		const response = await createBirthdayPdfHandler(fakes)({ locals: { user }, url });

		expect(response.status).toBe(status);
		expect(await response.json()).toEqual({ message });
		expect(readParam).not.toHaveBeenCalled();
		expect(fakes.birthdays.listMonthBirthdays).not.toHaveBeenCalled();
	});

	it.each(['', '?mes=0', '?mes=13'])('TU-17 rejects the month in "%s" without reading the model', async (query) => {
		const fakes = createFakes();

		const response = await requestBirthdayPdf(fakes, { query });

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ message: 'Escolha um mês de janeiro a dezembro.' });
		expect(fakes.birthdays.listMonthBirthdays).not.toHaveBeenCalled();
	});

	it('TU-18 warns about an empty month without generating', async () => {
		const fakes = createFakes([]);

		const response = await requestBirthdayPdf(fakes, { query: '?mes=11' });

		expect(response.status).toBe(422);
		expect(await response.json()).toEqual({ message: 'Nenhum aniversariante encontrado em novembro.' });
		expect(fakes.generateList).not.toHaveBeenCalled();
		expect(console.warn).toHaveBeenCalledWith('secretaria.aniversariantes.pdf_vazio', {
			mes: '2026-11',
			actorId: 'user-1',
		});
	});

	it.each(['secretaria', 'secretaria:admin'])('TU-19 serves the next January list privately to %s', async (roles) => {
		const fakes = createFakes();

		const response = await requestBirthdayPdf(fakes, { roles });

		expect(response.status).toBe(200);
		expect(Object.fromEntries(response.headers)).toMatchObject({
			'cache-control': 'private, no-store',
			'content-disposition': 'inline; filename="aniversariantes-2027-01.pdf"',
			'content-type': 'application/pdf',
			'x-content-type-options': 'nosniff',
		});
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(pdf.bytes);
		expect(fakes.generateList).toHaveBeenCalledWith({ month: JANUARY, generatedOn: TODAY, people });
	});

	it('TU-19 reads the requested month once and logs the generation without personal data', async () => {
		const fakes = createFakes();

		await requestBirthdayPdf(fakes);

		expect(fakes.today).toHaveBeenCalledOnce();
		expect(fakes.birthdays.listMonthBirthdays).toHaveBeenCalledWith(1);
		expect(console.info).toHaveBeenCalledWith('secretaria.aniversariantes.pdf_gerado', {
			mes: JANUARY.key,
			quantidade: people.length,
			paginas: pdf.pageCount,
			bytes: pdf.bytes.byteLength,
			duracaoMs: expect.any(Number),
			actorId: 'user-1',
		});
	});

	it('TU-20 translates a generation failure into a generic 500', async () => {
		const fakes = createFakes();
		const cause = new Error('pdf-lib failed');
		fakes.generateList.mockRejectedValue(cause);

		const response = await requestBirthdayPdf(fakes);

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({ message: 'Não foi possível gerar o PDF. Tente novamente.' });
		expect(console.error).toHaveBeenCalledWith('secretaria.aniversariantes.falha', {
			operacao: 'gerar_pdf',
			mes: JANUARY.key,
			error: cause,
		});
	});
});
