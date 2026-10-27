import { PageSizes, PDFDocument } from 'pdf-lib';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/server', async () => {
	const { readFileSync } = await import('node:fs');
	return { read: (asset: string) => new Response(readFileSync(asset.replace(/^\//, ''))) };
});

import { withTalkFixtures } from '../../../lib/server/models/palestra-test-support';
import { createRequestEvent, invoke, type TestUser } from '../../../support/request-event';
import { GET } from '../../../../../src/routes/(protected)/comunicacao/palestras/programacao/+server';

const PROGRAM_URL = 'http://localhost/comunicacao/palestras/programacao';
const [A4_WIDTH, A4_HEIGHT] = PageSizes.A4;

const createUser = (roles: string): TestUser => ({
	id: 'integration-programacao',
	username: 'programacao',
	name: 'Programação',
	roles,
});

const programEvent = (mes: string, user: TestUser | null = createUser('comunicacao')) =>
	createRequestEvent({ locals: { user, session: null }, url: new URL(`${PROGRAM_URL}?mes=${mes}`) });

const setBahiaNow = (instant: string) => {
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(new Date(instant));
};

describe('talk program route', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it.each(['comunicacao', 'comunicacao:admin'])('TI-02 serves an A4 program PDF to %s', async (roles) => {
		await withTalkFixtures(async ({ insertSpeaker, insertTalk, token }) => {
			setBahiaNow('2104-02-15T15:00:00Z');
			const palestranteId = await insertSpeaker(`Programa Amorim ${token}`);
			await insertTalk({ data: '2104-02-08', horario: '08:45', titulo: 'A prece', palestranteId });
			await insertTalk({ data: '2104-02-22', horario: '19:30', titulo: 'O perdão', palestranteId });

			const response = await invoke(GET, programEvent('2104-02', createUser(roles)));

			expect(response.status).toBe(200);
			expect(response.headers.get('content-type')).toBe('application/pdf');
			const document = await PDFDocument.load(new Uint8Array(await response.arrayBuffer()));
			expect(document.getPage(0).getSize()).toEqual({ width: A4_WIDTH, height: A4_HEIGHT });
		});
	});

	it.each([
		[null, 401],
		[createUser('secretaria'), 403],
	])('TI-03 denies the program to the user %o', async (user, status) => {
		setBahiaNow('2104-02-15T15:00:00Z');

		const response = await invoke(GET, programEvent('2104-02', user));

		expect(response.status).toBe(status);
		expect(response.headers.get('content-type')).toBe('application/json');
	});

	it('TI-04 blocks a month with talks missing the speaker or the title', async () => {
		await withTalkFixtures(async ({ insertSpeaker, insertTalk, token }) => {
			setBahiaNow('2104-07-01T15:00:00Z');
			const palestranteId = await insertSpeaker(`Programa Pendente ${token}`);
			const withoutSpeaker = await insertTalk({ data: '2104-07-05', horario: '08:45', titulo: 'A prece' });
			const withoutTitle = await insertTalk({ data: '2104-07-12', horario: '19:30', palestranteId });

			const response = await invoke(GET, programEvent('2104-07'));

			expect(response.status).toBe(422);
			expect(await response.json()).toEqual({
				message: 'Complete estas palestras no quadro para gerar a programação:',
				pendencias: [
					{ id: withoutSpeaker, quando: 'Sábado, 05/07/2104 · 08:45', falta: 'Falta o palestrante.' },
					{ id: withoutTitle, quando: 'Sábado, 12/07/2104 · 19:30', falta: 'Falta o título.' },
				],
			});
		});
	});

	it('TI-05 warns about a month without talks', async () => {
		setBahiaNow('2104-09-10T15:00:00Z');

		const response = await invoke(GET, programEvent('2104-09'));

		expect(response.status).toBe(422);
		expect(await response.json()).toEqual({
			message: 'Nenhuma palestra cadastrada em setembro de 2104.',
			pendencias: [],
		});
	});

	it.each([
		['2104-10', 422],
		['2104-12', 400],
	])('TI-06 validates %s against the Salvador date at 23:30 of October 31', async (mes, status) => {
		setBahiaNow('2104-11-01T02:30:00Z');

		const response = await invoke(GET, programEvent(mes));

		expect(response.status).toBe(status);
	});
});
