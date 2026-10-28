import { PageSizes, PDFDocument } from 'pdf-lib';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/server', async () => {
	const { readFileSync } = await import('node:fs');
	return { read: (asset: string) => new Response(readFileSync(asset.replace(/^\//, ''))) };
});

import { createTestName, model, withBirthdayCadastros } from '../../../lib/server/models/cadastro/test-support';
import { createRequestEvent, invoke, type TestUser } from '../../../support/request-event';
import { actions } from '../../../../../src/routes/(protected)/secretaria/aniversariantes/+page.server';
import { GET } from '../../../../../src/routes/(protected)/secretaria/aniversariantes/pdf/+server';

const BIRTHDAY_PAGE_URL = 'http://localhost/secretaria/aniversariantes';
const BIRTHDAY_PDF_URL = 'http://localhost/secretaria/aniversariantes/pdf';
const SALVADOR_OCTOBER_27 = '2026-10-27T15:00:00Z';
const SALVADOR_OCTOBER_31_LATE = '2026-11-01T02:30:00Z';
const [A4_WIDTH, A4_HEIGHT] = PageSizes.A4;

const createUser = (roles: string): TestUser => ({
	id: 'integration-aniversariantes',
	username: 'aniversariantes',
	name: 'Aniversariantes',
	roles,
});

const birthdayPdfEvent = (query: string, user: TestUser | null = createUser('secretaria')) =>
	createRequestEvent({ locals: { user, session: null }, url: new URL(`${BIRTHDAY_PDF_URL}${query}`) });

const setBahiaNow = (instant: string) => {
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(new Date(instant));
};

const withWorkerBornOn = <Result>(aniversario: string, callback: () => Promise<Result>) =>
	withBirthdayCadastros(
		[{ nome: createTestName('aniv'), trab: true, aniversario: new Date(aniversario), desencarnado: false }],
		callback,
	);

describe('birthday PDF route', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it.each(['secretaria', 'secretaria:admin'])('TI-02 serves an A4 birthday PDF to %s', async (roles) => {
		await withWorkerBornOn('1980-01-12', async () => {
			setBahiaNow(SALVADOR_OCTOBER_27);

			const response = await invoke(GET, birthdayPdfEvent('?mes=01', createUser(roles)));

			expect(response.status).toBe(200);
			expect(response.headers.get('content-type')).toBe('application/pdf');
			expect(response.headers.get('content-disposition')).toBe('inline; filename="aniversariantes-2027-01.pdf"');
			const document = await PDFDocument.load(new Uint8Array(await response.arrayBuffer()));
			expect(document.getPage(0).getSize()).toEqual({ width: A4_WIDTH, height: A4_HEIGHT });
		});
	});

	it.each([
		[null, 401],
		[createUser('comunicacao'), 403],
	])('TI-03 denies the birthday PDF to the user %o', async (user, status) => {
		const response = await invoke(GET, birthdayPdfEvent('?mes=01', user));

		expect(response.status).toBe(status);
		expect(response.headers.get('content-type')).toBe('application/json');
		expect(await response.json()).toEqual({ message: expect.any(String) });
	});

	it.each(['', '?mes=0', '?mes=13'])('TI-04 rejects the month in "%s"', async (query) => {
		const response = await invoke(GET, birthdayPdfEvent(query));

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ message: 'Escolha um mês de janeiro a dezembro.' });
	});

	it.each([
		[SALVADOR_OCTOBER_31_LATE, '10', '1975-10-20', 'aniversariantes-2026-10.pdf'],
		[SALVADOR_OCTOBER_27, '01', '1975-01-20', 'aniversariantes-2027-01.pdf'],
	])('TI-05 resolves the reference year at %s in Salvador for month %s', async (now, mes, aniversario, fileName) => {
		await withWorkerBornOn(aniversario, async () => {
			setBahiaNow(now);

			const response = await invoke(GET, birthdayPdfEvent(`?mes=${mes}`));

			expect(response.status).toBe(200);
			expect(response.headers.get('content-disposition')).toBe(`inline; filename="${fileName}"`);
		});
	});
});

const birthdayListEvent = (mes: string) => {
	const body = new FormData();
	body.append('mes', mes);
	return createRequestEvent({
		locals: { user: createUser('secretaria'), session: null },
		request: new Request(BIRTHDAY_PAGE_URL, { method: 'POST', body }),
		url: new URL(BIRTHDAY_PAGE_URL),
	});
};

const januaryWorker = (aniversario: string, desencarnado = false) => ({
	nome: createTestName('aniv'),
	trab: true,
	aniversario: new Date(aniversario),
	desencarnado,
});

describe('birthday list action', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('TI-06 lists the month birthdays with the reference year through the real composition', async () => {
		const seeds = [januaryWorker('1980-01-20'), januaryWorker('1975-01-05', true), januaryWorker('1990-01-05')];
		await withBirthdayCadastros(seeds, async (created) => {
			const seededIds = new Set(created.map(({ idleitor }) => idleitor));
			const isSeeded = ({ id }: { id: number }) => seededIds.has(id);
			setBahiaNow(SALVADOR_OCTOBER_27);

			const result = await invoke(actions.default, birthdayListEvent('01'));
			if (!result) throw new Error('Expected the birthday list');

			expect(result).toMatchObject({ mes: '01', ano: 2027 });
			const expected = (await model.listMonthBirthdays(1)).filter(isSeeded);
			expect(result.leitores.filter(isSeeded)).toEqual(expected);
			expect(expected).toHaveLength(seeds.length);
		});
	});
});
