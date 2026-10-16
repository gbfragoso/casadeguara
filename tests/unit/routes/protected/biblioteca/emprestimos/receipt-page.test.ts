// @vitest-environment happy-dom
import { afterNavigate, goto, type AfterNavigate } from '$app/navigation';
import { mount, tick, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReciboEmprestimo } from '#lib/receipts/loan-receipt.js';
import Page from '../../../../../../src/routes/(protected)/biblioteca/emprestimos/[id=integer]/recibo/+page.svelte';

vi.mock('$app/navigation', () => ({ afterNavigate: vi.fn(), goto: vi.fn(async () => undefined) }));

const RECEIPT_PATH = '/biblioteca/emprestimos/7/recibo';
const recibo: ReciboEmprestimo = {
	idemp: 7,
	leitor: 'Maria da Conceição Souza',
	tombo: '0457',
	titulo: 'O Livro dos Espíritos',
	exemplar: 2,
	dataEmprestimo: '01/10/2026',
	dataDevolucao: '15/10/2026',
};

let mounted: ReturnType<typeof mount> | undefined;
const print = vi.fn<Window['print']>();

beforeEach(() => {
	vi.stubGlobal('print', print);
});

afterEach(async () => {
	if (mounted) await unmount(mounted);
	mounted = undefined;
	document.body.replaceChildren();
	vi.clearAllMocks();
	vi.unstubAllGlobals();
});

const mountPage = async () => {
	const target = document.createElement('div');
	document.body.append(target);
	mounted = mount(Page, { target, props: { data: { recibo } } });
	await tick();
};

const notifyNavigation = (navigation: Pick<AfterNavigate, 'to'>) => {
	const callback = vi.mocked(afterNavigate).mock.calls.at(-1)?.[0];
	if (!callback) throw new Error('Callback de afterNavigate não registrado.');
	callback(navigation as AfterNavigate);
};

const arriveAt = (url: string) =>
	notifyNavigation({
		to: { url: new URL(url, 'http://localhost'), params: null, route: { id: null }, scroll: null },
	});

const getPrintButton = () => {
	const button = Array.from(document.querySelectorAll('button')).find(
		(element) => element.textContent?.trim() === 'Imprimir recibo',
	);
	if (!button) throw new Error('Botão "Imprimir recibo" não encontrado.');
	return button;
};

describe('receipt page', () => {
	it('clears the print request before printing once on arrival', async () => {
		await mountPage();

		arriveAt(`${RECEIPT_PATH}?imprimir=1`);

		await vi.waitFor(() => expect(print).toHaveBeenCalledOnce());
		expect(goto).toHaveBeenCalledExactlyOnceWith(RECEIPT_PATH, { replace: true, shallow: true });
		expect(vi.mocked(goto).mock.invocationCallOrder[0]).toBeLessThan(print.mock.invocationCallOrder[0]);
	});

	it('does not print when arriving without a print request', async () => {
		await mountPage();

		arriveAt(RECEIPT_PATH);

		expect(goto).not.toHaveBeenCalled();
		expect(print).not.toHaveBeenCalled();
		expect(getPrintButton().isConnected).toBe(true);
	});

	it('ignores a navigation without a target', async () => {
		await mountPage();

		notifyNavigation({ to: null });

		expect(goto).not.toHaveBeenCalled();
		expect(print).not.toHaveBeenCalled();
	});

	it('opens the print dialog on every button click', async () => {
		await mountPage();

		getPrintButton().click();
		getPrintButton().click();

		expect(print).toHaveBeenCalledTimes(2);
	});

	it('names the print button in Portuguese', async () => {
		await mountPage();

		const button = getPrintButton();

		expect(button.textContent?.trim()).toBe('Imprimir recibo');
		expect(button.hasAttribute('aria-label')).toBe(false);
	});
});
