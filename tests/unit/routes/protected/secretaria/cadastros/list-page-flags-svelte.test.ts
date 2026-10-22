// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/cadastros/+page.svelte';
import { getElement, renderComponent } from '../../../../lib/components/support/render-component.js';

vi.mock('$app/forms', () => ({ enhance: vi.fn() }));

const CADASTRO = {
	idleitor: 4,
	nome: 'MARIA',
	trab: false,
	frequencia: false,
	desencarnado: false,
	amigoFraterno: false,
};
const WORKER_LABEL = 'Marcar MARIA como trabalhador';
const FLAG_COLUMNS = [
	{ label: WORKER_LABEL, field: 'trab' },
	{ label: 'Marcar MARIA na frequência', field: 'frequencia' },
	{ label: 'Marcar MARIA como desencarnado', field: 'desencarnado' },
	{ label: 'Marcar MARIA para o Amigo Fraterno', field: 'amigoFraterno' },
];

afterEach(() => {
	vi.unstubAllGlobals();
});

const renderResults = (response: Response) => {
	const send = vi.fn().mockResolvedValue(response);
	vi.stubGlobal('fetch', send);
	return renderComponent(Page, {
		form: { cadastros: [CADASTRO], values: { nome: '', trabalhadores: 'false' } },
	}).then((target) => ({ target, send }));
};

const toggleFlag = (target: HTMLElement, label: string) => {
	const checkbox = getElement(target, `input[aria-label="${label}"]`, HTMLInputElement);
	checkbox.checked = true;
	checkbox.dispatchEvent(new Event('change', { bubbles: true }));
	return checkbox;
};

describe('secretaria registration list flags', () => {
	it.each(FLAG_COLUMNS)(
		'sends the $field flag of the registration to the cadastros endpoint',
		async ({ label, field }) => {
			const { target, send } = await renderResults(new Response(null, { status: 200 }));

			toggleFlag(target, label);

			await vi.waitFor(() =>
				expect(send).toHaveBeenCalledWith('/api/cadastros', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ field, id: 4, value: true }),
				}),
			);
		},
	);

	it('shows an alert and restores the flag when the update fails', async () => {
		const { target } = await renderResults(new Response(null, { status: 500 }));

		const checkbox = toggleFlag(target, WORKER_LABEL);

		await vi.waitFor(() =>
			expect(target.querySelector('[role="alert"]')?.textContent).toContain(
				'Não foi possível atualizar o cadastro. Tente novamente.',
			),
		);
		expect(checkbox.checked).toBe(false);
	});
});
