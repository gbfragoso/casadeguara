// @vitest-environment happy-dom
import { flushSync, mount, tick, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

type Submit = () => (result: { update: () => Promise<void> }) => Promise<void>;
const enhancerState = vi.hoisted(() => ({ submits: [] as Submit[] }));
vi.mock('$app/forms', () => ({
	enhance: (_form: unknown, submit?: Submit) => {
		if (submit) enhancerState.submits.push(submit);
	},
}));

import Page from '../../../../../../src/routes/(protected)/biblioteca/emprestimos/+page.svelte';

const LOAN = {
	idemp: 51,
	idleitor: 7,
	exemplar: 31,
	leitor: 'Rui Leitor',
	telefone: null,
	titulo: 'Caminhos da Luz',
	numero: 1,
	renovacoes: 0,
	data_devolucao: new Date('2099-01-10T00:00:00Z'),
	data_emprestimo: new Date('2098-12-27T00:00:00Z'),
	data_devolvido: null,
};

let mounted: ReturnType<typeof mount> | undefined;

afterEach(async () => {
	if (mounted) await unmount(mounted);
	mounted = undefined;
	document.body.replaceChildren();
	vi.unstubAllGlobals();
	enhancerState.submits.length = 0;
});

const mountLoans = async (isAdmin: boolean, response: Response | TypeError) => {
	const fetchLoan =
		response instanceof TypeError ? vi.fn().mockRejectedValue(response) : vi.fn().mockResolvedValue(response);
	vi.stubGlobal('fetch', fetchLoan);
	const target = document.createElement('div');
	document.body.append(target);
	mounted = mount(Page, {
		target,
		props: { data: { isAdmin }, form: { emprestimos: [LOAN], status: 200, message: 'OK' } },
	});
	await tick();
	return { target, fetchLoan };
};

const clickAction = (target: HTMLElement, label: string) => {
	target.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)?.click();
	flushSync();
};

const readStatus = (target: HTMLElement) => target.querySelector(`[id="${LOAN.idemp}"]`)?.textContent;

describe('loans page actions', () => {
	it('returns a loan and removes the return button', async () => {
		const { target, fetchLoan } = await mountLoans(false, new Response('', { status: 200 }));

		clickAction(target, 'Devolver');

		await vi.waitFor(() => expect(readStatus(target)).toBe('Devolvido'));
		expect(fetchLoan).toHaveBeenCalledWith(`/api/biblioteca/devolucao?id=${LOAN.idemp}`, { method: 'POST' });
		expect(target.querySelector('button[aria-label="Devolver"]')).toBeNull();
	});

	it('reports a failed return', async () => {
		const { target } = await mountLoans(false, new Response('', { status: 500 }));

		clickAction(target, 'Devolver');

		await vi.waitFor(() => expect(readStatus(target)).toBe('Erro ao devolver'));
	});

	it('reports a return interrupted by the network and offers it again', async () => {
		const { target } = await mountLoans(false, new TypeError('Failed to fetch'));

		clickAction(target, 'Devolver');

		await vi.waitFor(() => expect(readStatus(target)).toBe('Erro ao devolver'));
		expect(target.querySelector('button[aria-label="Devolver"]')).not.toBeNull();
	});

	it('reports a renewal interrupted by the network and offers it again', async () => {
		const { target } = await mountLoans(false, new TypeError('Failed to fetch'));

		clickAction(target, 'Renovar');

		await vi.waitFor(() => expect(readStatus(target)).toBe('Erro ao renovar'));
		expect(target.querySelector<HTMLButtonElement>('button[aria-label="Renovar"]')?.disabled).toBe(false);
	});

	it('renews a loan, shows the new due date and removes the renewal for regular users', async () => {
		const { target } = await mountLoans(false, new Response('2099-01-24', { status: 200 }));

		clickAction(target, 'Renovar');

		await vi.waitFor(() =>
			expect(target.querySelector(`[id="${LOAN.idemp}devolucao"]`)?.textContent).toBe('24/01/2099'),
		);
		expect(readStatus(target)).toBe('Renovado');
		expect(target.querySelector('button[aria-label="Renovar"]')).toBeNull();
	});

	it('keeps the renewal available to administrators', async () => {
		const { target } = await mountLoans(true, new Response('2099-01-24', { status: 200 }));

		clickAction(target, 'Renovar');

		await vi.waitFor(() => expect(readStatus(target)).toBe('Renovado'));
		expect(target.querySelector('button[aria-label="Renovar"]')).not.toBeNull();
	});

	it('reports a failed renewal', async () => {
		const { target } = await mountLoans(true, new Response('', { status: 500 }));

		clickAction(target, 'Renovar');

		await vi.waitFor(() => expect(readStatus(target)).toBe('Erro ao renovar'));
	});

	it('shows the search as loading until the results are updated', async () => {
		const { target } = await mountLoans(false, new Response('', { status: 200 }));
		const search = () => target.querySelector('form button[type="submit"]')?.getAttribute('aria-busy');

		const finish = enhancerState.submits[0]();
		flushSync();
		const whileLoading = search();
		await finish({ update: async () => undefined });
		flushSync();

		expect([whileLoading, search()]).toEqual(['true', 'false']);
	});

	it('discards the row updates when a new search returns', async () => {
		const { target } = await mountLoans(true, new Response('2099-01-24', { status: 200 }));
		clickAction(target, 'Renovar');
		await vi.waitFor(() => expect(readStatus(target)).toBe('Renovado'));

		await enhancerState.submits[0]()({ update: async () => undefined });
		flushSync();

		expect([readStatus(target), target.querySelector<HTMLButtonElement>('#renovar-51')?.disabled]).toEqual([
			'Ativo',
			false,
		]);
	});

	it('notifies the operation result returned to the page', async () => {
		vi.stubGlobal('fetch', vi.fn());
		const target = document.createElement('div');
		document.body.append(target);
		mounted = mount(Page, {
			target,
			props: { data: { isAdmin: false }, form: { status: 201, message: 'Registrado' } },
		});
		await tick();

		expect(target.querySelector('[data-testid="regiao-notificacao"]')?.textContent?.trim()).toBe('Registrado');
	});
});
