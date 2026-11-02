// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	NOVEMBER_REQUEST,
	findLink,
	generateNovemberPdf,
	pdfResponse,
	queryLink,
	readNotice,
	stubFetch,
	toggleWeekday,
	typeInto,
} from './page-support';

const READY_MESSAGE = 'Lista de frequência pronta para impressão.';
const NOVEMBER_QUERY = new URLSearchParams([
	...Object.entries(NOVEMBER_REQUEST),
	['dias', '1'],
	['dias', '2'],
	['dias', '4'],
]).toString();

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('TU-27 page delivers the attendance PDF', () => {
	it('asks for the PDF with the typed request', async () => {
		const fetcher = stubFetch(() => new Promise(() => undefined));

		await generateNovemberPdf();

		expect(fetcher).toHaveBeenCalledWith(`/secretaria/frequencia/pdf?${NOVEMBER_QUERY}`, expect.anything());
	});

	it('announces the generation of the PDF', async () => {
		stubFetch(() => new Promise(() => undefined));

		const target = await generateNovemberPdf();

		expect(readNotice(target, 'status')).toBe('Gerando o PDF…');
	});

	it('opens the PDF in a new tab and downloads it with the period file name', async () => {
		stubFetch(() => Promise.resolve(pdfResponse()));

		const target = await generateNovemberPdf();

		const open = await vi.waitFor(() => findLink(target, 'Abrir para imprimir'));
		expect(readNotice(target, 'status')).toBe(READY_MESSAGE);
		expect(open.getAttribute('href')).toMatch(/^blob:/);
		expect(open.target).toBe('_blank');
		expect(findLink(target, 'Baixar').getAttribute('download')).toBe('frequencia-2026-11-01-a-2026-11-30.pdf');
	});
});

describe('TU-28 page alerts the server message', () => {
	it('alerts the message of a list without workers', async () => {
		const message = 'Nenhum trabalhador marcado para a lista de frequência. Marque-os em Cadastros.';
		stubFetch(() => Promise.resolve(Response.json({ message }, { status: 422 })));

		const target = await generateNovemberPdf();

		await vi.waitFor(() => expect(readNotice(target, 'alert')).toBe(message));
	});
});

describe('TU-29 changing the request discards the ready PDF', () => {
	it.each([
		['the title', (target: HTMLElement) => typeInto(target, 'titulo', 'Outra lista')],
		['a date', (target: HTMLElement) => typeInto(target, 'dataFim', '2026-11-29')],
		['a weekday', (target: HTMLElement) => toggleWeekday(target, '3')],
	])('revokes and removes the PDF after changing %s', async (_, change) => {
		const revoke = vi.spyOn(URL, 'revokeObjectURL');
		stubFetch(() => Promise.resolve(pdfResponse()));
		const target = await generateNovemberPdf();
		const url = (await vi.waitFor(() => findLink(target, 'Abrir para imprimir'))).getAttribute('href');

		await change(target);

		expect(revoke).toHaveBeenCalledWith(url);
		expect(queryLink(target, 'Abrir para imprimir')).toBeUndefined();
		expect(target.querySelector('[role="status"]')).toBeNull();
	});
});
