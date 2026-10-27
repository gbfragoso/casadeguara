// @vitest-environment happy-dom
import { tick, type ComponentProps } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import TalkProgramDialog from '#lib/components/talks/TalkProgramDialog.svelte';
import { getElement, renderComponent } from '../support/render-component.js';

type DialogProps = ComponentProps<typeof TalkProgramDialog>;

const DIALOG_ID = 'programacao-do-mes';
const PENDENCY_MESSAGE = 'Complete estas palestras no quadro para gerar a programação:';
const PENDENCIES = [
	{ id: 501, quando: 'Segunda-feira, 02/11/2026 · 08:45', falta: 'Falta o palestrante.' },
	{ id: 507, quando: 'Sábado, 07/11/2026 · 14:30', falta: 'Falta o título.' },
];

const pdfResponse = () => new Response(new Blob(['%PDF'], { type: 'application/pdf' }));

const servePdf = () => vi.fn<typeof fetch>(() => Promise.resolve(pdfResponse()));

const neverRespond = () => vi.fn<typeof fetch>(() => new Promise(() => undefined));

const refuseWith = (body: unknown) => vi.fn<typeof fetch>(() => Promise.resolve(Response.json(body, { status: 422 })));

const renderDialog = (props: Partial<DialogProps> = {}) =>
	renderComponent(TalkProgramDialog, { id: DIALOG_ID, hoje: '2026-10-27', fetcher: servePdf(), ...props });

const toggleDialog = async (newState: 'open' | 'closed') => {
	const dialog = getElement(document, `#${DIALOG_ID}`, HTMLElement);
	dialog.dispatchEvent(Object.assign(new Event('toggle'), { newState }));
	await tick();
	return dialog;
};

const findMonth = (target: HTMLElement, label: string) => {
	const button = [...target.querySelectorAll('button')].find((control) => control.textContent?.trim() === label);
	if (!button) throw new Error(`Mês não encontrado: ${label}`);
	return button;
};

const chooseMonth = async (target: HTMLElement, label: string) => {
	findMonth(target, label).click();
	await tick();
};

const readMonths = (target: HTMLElement) =>
	[...target.querySelectorAll('[role="group"] button')].map((button) => [
		button.textContent?.trim(),
		button.getAttribute('aria-pressed'),
	]);

const readNotice = (target: HTMLElement, role: 'status' | 'alert') =>
	target.querySelector(`[role="${role}"]`)?.textContent?.trim();

const findLink = (target: HTMLElement, text: string) => {
	const link = [...target.querySelectorAll('a')].find((control) => control.textContent?.trim() === text);
	if (!link) throw new Error(`Link não encontrado: ${text}`);
	return link;
};

const waitForReady = (target: HTMLElement) => vi.waitFor(() => findLink(target, 'Abrir para imprimir'));

afterEach(() => {
	vi.restoreAllMocks();
});

describe('TU-31 TalkProgramDialog offers the months', () => {
	it('offers the current and the next month without a preselection', async () => {
		const target = await renderDialog();

		expect(readMonths(target)).toEqual([
			['Outubro de 2026', 'false'],
			['Novembro de 2026', 'false'],
		]);
	});

	it('focuses the dialog titled by the program heading when it opens', async () => {
		await renderDialog();

		const dialog = await toggleDialog('open');

		expect(document.activeElement).toBe(dialog);
		expect(document.getElementById(dialog.getAttribute('aria-labelledby') ?? '')?.textContent?.trim()).toBe(
			'Programação do mês',
		);
	});
});

describe('TU-32 TalkProgramDialog delivers the PDF', () => {
	it('announces the generation and marks the chosen month', async () => {
		const target = await renderDialog({ fetcher: neverRespond() });

		await chooseMonth(target, 'Novembro de 2026');

		expect(readNotice(target, 'status')).toBe('Gerando a programação…');
		expect(findMonth(target, 'Novembro de 2026').getAttribute('aria-pressed')).toBe('true');
	});

	it('announces the PDF ready for printing', async () => {
		const target = await renderDialog();

		await chooseMonth(target, 'Novembro de 2026');

		await vi.waitFor(() =>
			expect(readNotice(target, 'status')).toBe('Programação de novembro de 2026 pronta para impressão.'),
		);
	});

	it('opens the PDF in a new tab', async () => {
		const target = await renderDialog();

		await chooseMonth(target, 'Novembro de 2026');
		const open = await waitForReady(target);

		expect(open.target).toBe('_blank');
		expect(open.getAttribute('href')).toMatch(/^blob:/);
	});

	it('downloads the same PDF with the month file name', async () => {
		const target = await renderDialog();

		await chooseMonth(target, 'Novembro de 2026');
		const open = await waitForReady(target);

		const download = findLink(target, 'Baixar');
		expect(download.getAttribute('download')).toBe('programacao-palestras-2026-11.pdf');
		expect(download.getAttribute('href')).toBe(open.getAttribute('href'));
	});

	it('keeps the close command beside the PDF commands', async () => {
		const target = await renderDialog();

		await chooseMonth(target, 'Novembro de 2026');
		await waitForReady(target);

		const commands = [...target.querySelectorAll('a, button:not([aria-pressed])')].map((control) =>
			control.textContent?.trim(),
		);
		expect(commands).toEqual(['Abrir para imprimir', 'Baixar', 'Fechar']);
	});
});

describe('TU-33 TalkProgramDialog shows refusals', () => {
	it('lists what each talk is missing', async () => {
		const target = await renderDialog({
			fetcher: refuseWith({ message: PENDENCY_MESSAGE, pendencias: PENDENCIES }),
		});

		await chooseMonth(target, 'Novembro de 2026');

		await vi.waitFor(() => expect(readNotice(target, 'alert')).toContain(PENDENCY_MESSAGE));
		const items = [...target.querySelectorAll('[role="alert"] li')].map((item) => item.textContent?.trim());
		expect(items).toEqual([
			'Segunda-feira, 02/11/2026 · 08:45: Falta o palestrante.',
			'Sábado, 07/11/2026 · 14:30: Falta o título.',
		]);
	});

	it('explains an empty month without a list', async () => {
		const message = 'Nenhuma palestra cadastrada em novembro de 2026.';
		const target = await renderDialog({ fetcher: refuseWith({ message, pendencias: [] }) });

		await chooseMonth(target, 'Novembro de 2026');

		await vi.waitFor(() => expect(readNotice(target, 'alert')).toBe(message));
		expect(target.querySelector('[role="alert"] ul')).toBeNull();
	});
});

describe('TU-34 TalkProgramDialog shows only the last chosen month', () => {
	it('ignores the slow answer of the month chosen before', async () => {
		let deliverOctober: (response: Response) => void = () => undefined;
		const fetcher = vi.fn<typeof fetch>((input) =>
			String(input).endsWith('2026-10')
				? new Promise((resolve) => (deliverOctober = resolve))
				: Promise.resolve(pdfResponse()),
		);
		const target = await renderDialog({ fetcher });
		await chooseMonth(target, 'Outubro de 2026');
		await chooseMonth(target, 'Novembro de 2026');
		await waitForReady(target);

		deliverOctober(pdfResponse());
		await tick();

		expect(fetcher.mock.calls[0][1]?.signal?.aborted).toBe(true);
		expect(readNotice(target, 'status')).toBe('Programação de novembro de 2026 pronta para impressão.');
		expect(findMonth(target, 'Outubro de 2026').getAttribute('aria-pressed')).toBe('false');
	});
});

describe('TU-35 TalkProgramDialog cancels on close', () => {
	it('aborts the generation in progress', async () => {
		const fetcher = neverRespond();
		const target = await renderDialog({ fetcher });
		await toggleDialog('open');
		await chooseMonth(target, 'Novembro de 2026');

		await toggleDialog('closed');

		expect(fetcher.mock.calls[0][1]?.signal?.aborted).toBe(true);
	});

	it('revokes the PDF that was ready', async () => {
		const revoke = vi.spyOn(URL, 'revokeObjectURL');
		const target = await renderDialog();
		await toggleDialog('open');
		await chooseMonth(target, 'Novembro de 2026');
		const url = (await waitForReady(target)).getAttribute('href');

		await toggleDialog('closed');

		expect(revoke).toHaveBeenCalledWith(url);
	});

	it('reopens without a chosen month', async () => {
		const target = await renderDialog();
		await toggleDialog('open');
		await chooseMonth(target, 'Novembro de 2026');
		await waitForReady(target);
		await toggleDialog('closed');

		await toggleDialog('open');

		expect(readMonths(target).map(([, pressed]) => pressed)).toEqual(['false', 'false']);
		expect(target.querySelector('a')).toBeNull();
	});
});
