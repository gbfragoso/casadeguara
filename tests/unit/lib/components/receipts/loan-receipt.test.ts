import { render } from 'svelte/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import LoanReceipt from '#lib/components/receipts/LoanReceipt.svelte';
import type { ReciboEmprestimo } from '#lib/receipts/loan-receipt.js';
import { parseRenderedBody } from '../../../support/rendered-document';

const LIBRARY_COPY = 'section[aria-label="Via da biblioteca"]';
const READER_COPY = 'section[aria-label="Via do leitor"]';
const RECEIPT = '[data-testid="recibo-termico"]';
const RULES = 'Prazo de 14 dias. Pode ser renovado uma vez, por mais 14 dias.';

const buildRecibo = (overrides: Partial<ReciboEmprestimo> = {}): ReciboEmprestimo => ({
	idemp: 1234,
	leitor: 'Maria da Conceição Souza',
	tombo: '0457',
	titulo: 'O Livro dos Espíritos',
	exemplar: 2,
	dataEmprestimo: '01/10/2026',
	dataDevolucao: '15/10/2026',
	...overrides,
});

const renderReceipt = (recibo: ReciboEmprestimo) => parseRenderedBody(render(LoanReceipt, { props: { recibo } }).body);

const normalizedText = (element: { textContent: string | null } | null) =>
	(element?.textContent ?? '').replace(/\s+/g, ' ').trim();

const occurrences = (text: string, value: string) => text.split(value).length - 1;

describe('LoanReceipt', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('shows the control fields on the library copy', () => {
		const document = renderReceipt(buildRecibo());

		const text = normalizedText(document.querySelector(LIBRARY_COPY));

		expect(text).toContain('Biblioteca Batuíra Recibo de empréstimo Via da biblioteca');
		expect(text).toContain('Empréstimo nº 1234 Data: 01/10/2026');
		expect(text).toContain('Leitor: Maria da Conceição Souza');
		expect(text).toContain('Livro: 0457 O Livro dos Espíritos');
		expect(text).toContain('Exemplar: 2 Devolver até: 15/10/2026');
		expect(text).toContain('Renovado para: ____/____/______');
		expect(text).toContain('Recebido por:');
		expect(normalizedText(document.querySelector(`${LIBRARY_COPY} footer`))).toBe(
			'Maria da Conceição Souza Fora da caridade não há salvação',
		);
	});

	it('highlights the return date and states the rules on the reader copy', () => {
		const document = renderReceipt(buildRecibo());

		const readerCopy = document.querySelector(READER_COPY);
		const text = normalizedText(readerCopy);

		expect(text).toContain('Via do leitor');
		expect(text).toContain('Empréstimo nº 1234 Data: 01/10/2026');
		expect(text).toContain('Exemplar: 2');
		const paragraphs = [...(readerCopy?.querySelectorAll('p') ?? [])].map(normalizedText);
		expect(paragraphs).toContain('Devolver até 15/10/2026');
		expect(text).toContain(RULES);
		expect(readerCopy?.querySelector('footer')).toBeNull();
		expect(text).not.toContain('Renovado para');
		expect(text).not.toContain('Recebido por');
	});

	it('orders the library copy, the cut line and the reader copy', () => {
		const document = renderReceipt(buildRecibo());

		const text = normalizedText(document.querySelector(RECEIPT));

		const libraryIndex = text.indexOf('Via da biblioteca');
		const cutIndex = text.indexOf('corte aqui');
		const readerIndex = text.indexOf('Via do leitor');
		expect(libraryIndex).toBeGreaterThanOrEqual(0);
		expect(cutIndex).toBeGreaterThan(libraryIndex);
		expect(readerIndex).toBeGreaterThan(cutIndex);
	});

	it('shows an 80-character title and a 60-character name in full on both copies', () => {
		const titulo = 'A'.repeat(39) + ' ' + 'B'.repeat(40);
		const leitor = 'C'.repeat(29) + ' ' + 'D'.repeat(30);
		const document = renderReceipt(buildRecibo({ titulo, leitor }));

		const libraryText = normalizedText(document.querySelector(LIBRARY_COPY));
		const readerText = normalizedText(document.querySelector(READER_COPY));

		expect(titulo).toHaveLength(80);
		expect(leitor).toHaveLength(60);
		expect(libraryText).toContain(titulo);
		expect(libraryText).toContain(leitor);
		expect(readerText).toContain(titulo);
		expect(readerText).toContain(leitor);
		expect(normalizedText(document.querySelector(RECEIPT))).not.toMatch(/…|\.\.\./);
	});

	it('contains no images or icons', () => {
		const document = renderReceipt(buildRecibo());

		const receipt = document.querySelector(RECEIPT);

		expect(receipt).not.toBeNull();
		expect(receipt?.querySelectorAll('img, svg, picture, canvas, i')).toHaveLength(0);
	});

	it('uses the contract dates instead of the current date', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 9, 10, 12));

		const text = normalizedText(renderReceipt(buildRecibo()).querySelector(RECEIPT));

		expect(occurrences(text, '01/10/2026')).toBe(2);
		expect(occurrences(text, '15/10/2026')).toBe(2);
		expect(text).not.toContain('10/10/2026');
	});

	it('shows a dash for missing dates on both copies', () => {
		const document = renderReceipt(buildRecibo({ dataEmprestimo: null, dataDevolucao: null }));

		const libraryText = normalizedText(document.querySelector(LIBRARY_COPY));
		const readerText = normalizedText(document.querySelector(READER_COPY));

		expect(libraryText).toContain('Data: —');
		expect(libraryText).toContain('Devolver até: —');
		expect(readerText).toContain('Data: —');
		expect(readerText).toContain('Devolver até —');
	});
});
