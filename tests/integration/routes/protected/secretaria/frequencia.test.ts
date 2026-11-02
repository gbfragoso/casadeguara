import { PageSizes, PDFDocument } from 'pdf-lib';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/server', async () => {
	const { readFileSync } = await import('node:fs');
	return { read: (asset: string) => new Response(readFileSync(asset.replace(/^\//, ''))) };
});

import { createTestName, withSeededCadastros } from '../../../lib/server/models/cadastro/test-support';
import { createRequestEvent, invoke, type TestUser } from '../../../support/request-event';
import { GET } from '../../../../../src/routes/(protected)/secretaria/frequencia/pdf/+server';

const ATTENDANCE_PDF_URL = 'http://localhost/secretaria/frequencia/pdf';
const TITLE = 'Lista de presença';
const VALID_QUERY = `?titulo=${encodeURIComponent(TITLE)}&dataInicio=2026-11-01&dataFim=2026-11-30&dias=1&dias=2&dias=4`;
const [A4_WIDTH, A4_HEIGHT] = PageSizes.A4;

const createUser = (roles: string): TestUser => ({
	id: 'integration-frequencia',
	username: 'frequencia',
	name: 'Frequência',
	roles,
});

const attendancePdfEvent = (user: TestUser | null) =>
	createRequestEvent({ locals: { user, session: null }, url: new URL(`${ATTENDANCE_PDF_URL}${VALID_QUERY}`) });

describe('attendance PDF route', () => {
	it.each(['secretaria', 'secretaria:admin'])('TI-02 serves an A4 attendance PDF to %s', async (roles) => {
		await withSeededCadastros([{ nome: createTestName('freq'), trab: true, frequencia: true }], async () => {
			const response = await invoke(GET, attendancePdfEvent(createUser(roles)));

			expect(response.status).toBe(200);
			expect(response.headers.get('content-type')).toBe('application/pdf');
			expect(response.headers.get('content-disposition')).toBe(
				'inline; filename="frequencia-2026-11-01-a-2026-11-30.pdf"',
			);
			const document = await PDFDocument.load(new Uint8Array(await response.arrayBuffer()));
			expect(document.getTitle()).toBe(TITLE);
			expect(document.getPage(0).getSize()).toEqual({ width: A4_WIDTH, height: A4_HEIGHT });
		});
	});

	it.each([
		[null, 401],
		[createUser('comunicacao'), 403],
	])('TI-03 refuses the attendance PDF to the user %o', async (user, status) => {
		const response = await invoke(GET, attendancePdfEvent(user));

		expect(response.status).toBe(status);
		expect(response.headers.get('content-type')).toBe('application/json');
		expect(await response.json()).toEqual({ message: expect.any(String) });
	});
});
