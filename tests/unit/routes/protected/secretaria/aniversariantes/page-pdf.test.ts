// @vitest-environment happy-dom
import { tick, type ComponentProps } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/aniversariantes/+page.svelte';
import { getElement, renderComponent } from '../../../../lib/components/support/render-component.js';

vi.mock('$app/forms', () => ({ enhance: vi.fn() }));

const READY_MESSAGE = 'Lista de aniversariantes de novembro de 2026 pronta para impressão.';

const pdfResponse = () => new Response(new Blob(['%PDF'], { type: 'application/pdf' }));

const stubFetch = (respond: () => Promise<Response>) => {
	const fetcher = vi.fn<typeof fetch>(respond);
	vi.stubGlobal('fetch', fetcher);
	return fetcher;
};

type PageForm = ComponentProps<typeof Page>['form'];

const NOVEMBER_SEARCH = { leitores: [{ id: 31, nome: 'Maria', dia: 3, desencarnado: false }], mes: '11', ano: 2026 };

const renderPage = (form: PageForm) =>
	renderComponent(Page, {
		data: { username: 'secretaria@example.com', userid: 'user-1', isAdmin: false, hoje: '2026-10-27' },
		form,
	});

const changeMonth = async (target: HTMLElement) => {
	getElement(target, 'select[name="mes"]', HTMLSelectElement).dispatchEvent(new Event('change', { bubbles: true }));
	await tick();
};

const generatePdf = async (target: HTMLElement) => {
	const button = [...target.querySelectorAll('button')].find(
		(control) => control.textContent?.trim() === 'Gerar PDF',
	);
	button?.click();
	await tick();
};

const readNotice = (target: HTMLElement, role: 'status' | 'alert') =>
	target.querySelector(`[role="${role}"]`)?.textContent?.trim();

const queryLink = (target: HTMLElement, text: string) =>
	[...target.querySelectorAll('a')].find((control) => control.textContent?.trim() === text);

const findLink = (target: HTMLElement, text: string) => {
	const link = queryLink(target, text);
	if (!link) throw new Error(`Link não encontrado: ${text}`);
	return link;
};

const generateNovemberPdf = async (form: PageForm = NOVEMBER_SEARCH) => {
	const target = await renderPage(form);
	await generatePdf(target);
	return target;
};

beforeEach(() => {
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(new Date('2026-10-27T10:00:00-03:00'));
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('TU-37 "Gerar PDF" delivers the birthday PDF', () => {
	it('asks for the current month without generating the list first', async () => {
		const fetcher = stubFetch(() => new Promise(() => undefined));
		const target = await renderPage(null);

		await generatePdf(target);

		expect(fetcher).toHaveBeenCalledWith('/secretaria/aniversariantes/pdf?mes=10', expect.anything());
	});

	it('announces the generation of the PDF', async () => {
		stubFetch(() => new Promise(() => undefined));

		const target = await generateNovemberPdf();

		expect(readNotice(target, 'status')).toBe('Gerando o PDF…');
	});

	it('announces the PDF ready for printing', async () => {
		stubFetch(() => Promise.resolve(pdfResponse()));

		const target = await generateNovemberPdf();

		await vi.waitFor(() => expect(readNotice(target, 'status')).toBe(READY_MESSAGE));
	});

	it('opens and downloads the PDF with the reference month file name', async () => {
		stubFetch(() => Promise.resolve(pdfResponse()));

		const target = await generateNovemberPdf();

		const open = await vi.waitFor(() => findLink(target, 'Abrir para imprimir'));
		const download = findLink(target, 'Baixar');
		expect(open.getAttribute('href')).toMatch(/^blob:/);
		expect(open.target).toBe('_blank');
		expect(download.getAttribute('download')).toBe('aniversariantes-2026-11.pdf');
	});
});

describe('TU-38 "Gerar PDF" shows notices and failures', () => {
	it('alerts the same notice as the empty list of the month', async () => {
		const message = 'Nenhum aniversariante encontrado em novembro.';
		stubFetch(() => Promise.resolve(Response.json({ message }, { status: 422 })));

		const target = await generateNovemberPdf({ leitores: [], mes: '11', ano: 2026 });

		await vi.waitFor(() => expect(readNotice(target, 'alert')).toBe(message));
		expect([...target.querySelectorAll('[role="status"]')].map((notice) => notice.textContent?.trim())).toEqual([
			message,
		]);
	});

	it('alerts a network failure with the generic message', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		stubFetch(() => Promise.reject(new TypeError('Failed to fetch')));

		const target = await generateNovemberPdf();

		await vi.waitFor(() =>
			expect(readNotice(target, 'alert')).toBe('Não foi possível gerar o PDF. Tente novamente.'),
		);
	});
});

describe('TU-39 changing the month clears the PDF', () => {
	it('revokes and removes the ready PDF', async () => {
		const revoke = vi.spyOn(URL, 'revokeObjectURL');
		stubFetch(() => Promise.resolve(pdfResponse()));
		const target = await generateNovemberPdf();
		const url = (await vi.waitFor(() => findLink(target, 'Abrir para imprimir'))).getAttribute('href');

		await changeMonth(target);

		expect(revoke).toHaveBeenCalledWith(url);
		expect(queryLink(target, 'Abrir para imprimir')).toBeUndefined();
		expect(target.querySelector('[role="status"]')).toBeNull();
	});

	it('aborts the generation in progress', async () => {
		const fetcher = stubFetch(() => new Promise(() => undefined));
		const target = await generateNovemberPdf();

		await changeMonth(target);

		expect(fetcher.mock.calls[0][1]?.signal?.aborted).toBe(true);
		expect(target.querySelector('[role="status"]')).toBeNull();
	});

	it('shows only the result of the last click', async () => {
		let deliverFirst: (response: Response) => void = () => undefined;
		const message = 'Nenhum aniversariante encontrado em novembro.';
		const fetcher = stubFetch(() => new Promise((resolve) => (deliverFirst = resolve)));
		const target = await generateNovemberPdf();
		fetcher.mockImplementation(() => Promise.resolve(Response.json({ message }, { status: 422 })));
		await generatePdf(target);
		await vi.waitFor(() => expect(readNotice(target, 'alert')).toBe(message));

		deliverFirst(pdfResponse());
		await tick();

		expect(fetcher.mock.calls[0][1]?.signal?.aborted).toBe(true);
		expect(queryLink(target, 'Abrir para imprimir')).toBeUndefined();
	});
});
