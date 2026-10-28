// @vitest-environment happy-dom
import type { ComponentProps } from 'svelte';
import { describe, expect, it } from 'vitest';

import PdfOutcome from '#lib/components/feedback/PdfOutcome.svelte';
import { htmlSnippet, renderComponent } from '../support/render-component.js';

type OutcomeProps = ComponentProps<typeof PdfOutcome>;

const PDF_URL = 'blob:http://localhost/aniversariantes';

const renderOutcome = (outcome: OutcomeProps['outcome'], props: Partial<OutcomeProps> = {}) =>
	renderComponent(PdfOutcome, {
		outcome,
		loadingLabel: 'Gerando o PDF…',
		readyLabel: 'Lista de aniversariantes de novembro de 2026 pronta para impressão.',
		fileName: 'aniversariantes-2026-11.pdf',
		...props,
	});

const findLink = (target: HTMLElement, text: string) => {
	const link = [...target.querySelectorAll('a')].find((control) => control.textContent?.trim() === text);
	if (!link) throw new Error(`Link não encontrado: ${text}`);
	return link;
};

const readNotice = (target: HTMLElement, role: 'status' | 'alert') =>
	target.querySelector(`[role="${role}"]`)?.textContent?.trim();

describe('TU-10 PdfOutcome shows the generation', () => {
	it('announces the generation in progress as a status', async () => {
		const target = await renderOutcome({ status: 'loading', subject: '2026-11' });

		expect(readNotice(target, 'status')).toBe('Gerando o PDF…');
	});

	it('announces the ready PDF as a status', async () => {
		const target = await renderOutcome({ status: 'ready', subject: '2026-11', url: PDF_URL });

		expect(readNotice(target, 'status')).toBe(
			'Lista de aniversariantes de novembro de 2026 pronta para impressão.',
		);
	});

	it('opens the ready PDF in a new tab', async () => {
		const target = await renderOutcome({ status: 'ready', subject: '2026-11', url: PDF_URL });

		const open = findLink(target, 'Abrir para imprimir');
		expect(open.getAttribute('href')).toBe(PDF_URL);
		expect(open.target).toBe('_blank');
		expect(open.rel).toBe('noopener');
	});

	it('downloads the ready PDF with the file name', async () => {
		const target = await renderOutcome({ status: 'ready', subject: '2026-11', url: PDF_URL });

		const download = findLink(target, 'Baixar');
		expect(download.getAttribute('href')).toBe(PDF_URL);
		expect(download.getAttribute('download')).toBe('aniversariantes-2026-11.pdf');
	});

	it('shows the failure as an alert without PDF commands', async () => {
		const message = 'Nenhum aniversariante encontrado em novembro.';

		const target = await renderOutcome({ status: 'failed', subject: '2026-11', message });

		expect(readNotice(target, 'alert')).toBe(message);
		expect(target.querySelector('a')).toBeNull();
	});
});

describe('TU-10 PdfOutcome renders the snippets', () => {
	it('renders the details below the failure message', async () => {
		const outcome = { status: 'failed' as const, subject: '2026-11', message: 'Complete estas palestras:' };

		const target = await renderOutcome(outcome, { details: htmlSnippet('<ul><li>Falta o título.</li></ul>') });

		expect(target.querySelector('[role="alert"] li')?.textContent).toBe('Falta o título.');
	});

	it('renders the actions after the PDF commands', async () => {
		const outcome = { status: 'ready' as const, subject: '2026-11', url: PDF_URL };

		const target = await renderOutcome(outcome, { actions: htmlSnippet('<button type="button">Fechar</button>') });

		const commands = [...target.querySelectorAll('a, button')].map((control) => control.textContent?.trim());
		expect(commands).toEqual(['Abrir para imprimir', 'Baixar', 'Fechar']);
	});
});
