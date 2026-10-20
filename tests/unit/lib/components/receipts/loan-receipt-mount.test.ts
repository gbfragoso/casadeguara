// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import LoanReceipt from '#lib/components/receipts/LoanReceipt.svelte';
import type { ReciboEmprestimo } from '#lib/receipts/loan-receipt.js';
import { getElement, renderComponent } from '../support/render-component.js';

const RECIBO: ReciboEmprestimo = {
	idemp: 1234,
	leitor: 'Maria da Conceição Souza',
	tombo: '0457',
	titulo: 'O Livro dos Espíritos',
	exemplar: 2,
	dataEmprestimo: '01/10/2026',
	dataDevolucao: '15/10/2026',
};

const readCopies = (target: HTMLElement) =>
	[...getElement(target, '[data-testid="recibo-termico"]', HTMLElement).children].map(
		(element) => element.getAttribute('aria-label') ?? element.textContent?.trim(),
	);

describe('LoanReceipt in the browser', () => {
	it('renders the library copy, the cut line and the reader copy in order', async () => {
		const target = await renderComponent(LoanReceipt, { recibo: RECIBO });

		expect(readCopies(target)).toEqual(['Via da biblioteca', 'corte aqui', 'Via do leitor']);
	});

	it('shows the return deadline on the reader copy', async () => {
		const target = await renderComponent(LoanReceipt, { recibo: RECIBO });

		const readerCopy = getElement(target, 'section[aria-label="Via do leitor"]', HTMLElement);

		expect(readerCopy.textContent).toContain('Devolver até 15/10/2026');
	});

	it('marks missing loan dates with a dash on both copies', async () => {
		const target = await renderComponent(LoanReceipt, {
			recibo: { ...RECIBO, dataEmprestimo: null, dataDevolucao: null },
		});

		const libraryCopy = getElement(target, 'section[aria-label="Via da biblioteca"]', HTMLElement);
		const readerCopy = getElement(target, 'section[aria-label="Via do leitor"]', HTMLElement);

		expect(libraryCopy.textContent).toContain('Data: —');
		expect(libraryCopy.textContent).toContain('Devolver até: —');
		expect(readerCopy.textContent).toContain('Devolver até —');
	});
});
