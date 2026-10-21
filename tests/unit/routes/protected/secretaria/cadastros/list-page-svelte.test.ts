import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';

import { updateCadastroFlag } from '../../../../../../src/lib/cadastros/flags';
import Page from '../../../../../../src/routes/(protected)/secretaria/cadastros/+page.svelte';
import { getRenderedAnchor, getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

describe('secretaria registration list page', () => {
	it('retains search values and renders accessible errors, empty states, and results', () => {
		const { body: invalidBody } = render(Page, {
			props: { form: { values: { nome: 'Maria', trabalhadores: 'true' }, errors: { nome: ['Nome inválido.'] } } },
		});
		const { body: emptyBody } = render(Page, {
			props: { form: { cadastros: [], values: { nome: '', trabalhadores: 'false' } } },
		});
		const { body: resultsBody } = render(Page, {
			props: {
				form: {
					cadastros: [
						{
							idleitor: 4,
							nome: 'MARIA',
							trab: true,
							frequencia: false,
							desencarnado: false,
							amigoFraterno: false,
						},
					],
					values: { nome: '', trabalhadores: 'false' },
				},
			},
		});
		const invalid = parseRenderedBody(invalidBody);
		const empty = parseRenderedBody(emptyBody);
		const results = parseRenderedBody(resultsBody);

		expect(getRenderedInput(invalid, 'input[name="nome"]').value).toBe('Maria');
		expect(getRenderedInput(invalid, 'input[type="checkbox"][name="trabalhadores"]').checked).toBe(true);
		expect(getRenderedInput(invalid, 'input[name="nome"]').getAttribute('aria-describedby')).toBe('nome-errors');
		expect(invalid.querySelector('#nome-errors')?.textContent).toContain('Nome inválido.');
		expect(empty.body.textContent).toContain('Nenhum cadastro encontrado.');
		expect(getRenderedInput(results, 'input[aria-label="Marcar MARIA como trabalhador"]').checked).toBe(true);
		expect(getRenderedAnchor(results, 'tbody a').getAttribute('aria-label')).toBe('Editar cadastro de MARIA');
	});

	it('shows the search form without results before the first search', () => {
		const document = parseRenderedBody(render(Page, { props: { form: null } }).body);

		expect(getRenderedInput(document, 'input[name="nome"]').value).toBe('');
		expect(document.querySelector('table')).toBeNull();
	});

	it('associates a workers filter error with its checkbox', () => {
		const { body } = render(Page, {
			props: {
				form: { values: { nome: '', trabalhadores: 'x' }, errors: { trabalhadores: ['Filtro inválido.'] } },
			},
		});
		const document = parseRenderedBody(body);

		const checkbox = getRenderedInput(document, 'input[type="checkbox"][name="trabalhadores"]');

		expect(checkbox.getAttribute('aria-invalid')).toBe('true');
		const description = document.getElementById(checkbox.getAttribute('aria-describedby') ?? '');
		expect(description?.textContent).toContain('Filtro inválido.');
	});

	it('keeps a single element for the name error description', () => {
		const { body } = render(Page, {
			props: { form: { values: { nome: '', trabalhadores: 'false' }, errors: { nome: ['Nome inválido.'] } } },
		});
		const document = parseRenderedBody(body);

		expect(document.querySelectorAll('#nome-errors')).toHaveLength(1);
	});

	it('rolls back a failed flag update with a visible error', async () => {
		const checkbox = { checked: true };
		const pending: boolean[] = [];
		const errors: string[] = [];
		const send = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));

		await updateCadastroFlag(checkbox, { id: 4, field: 'trab' }, send, {
			setPending: (_, __, active) => pending.push(active),
			setError: (message) => errors.push(message),
		});

		expect(send).toHaveBeenCalledWith({ id: 4, field: 'trab', value: true });
		expect(checkbox.checked).toBe(false);
		expect(pending).toEqual([true, false]);
		expect(errors.at(-1)).toBe('Não foi possível atualizar o cadastro. Tente novamente.');
	});

	it('keeps a successful flag value after its pending state ends', async () => {
		const checkbox = { checked: false };
		const pending: boolean[] = [];

		await updateCadastroFlag(checkbox, { id: 4, field: 'frequencia' }, () => Promise.resolve(new Response()), {
			setPending: (_, __, active) => pending.push(active),
			setError: vi.fn(),
		});

		expect(checkbox.checked).toBe(false);
		expect(pending).toEqual([true, false]);
	});

	it('rolls a flag back when the request cannot reach the endpoint', async () => {
		const checkbox = { checked: true };
		const errors: string[] = [];

		await updateCadastroFlag(checkbox, { id: 4, field: 'desencarnado' }, () => Promise.reject(new Error()), {
			setPending: vi.fn(),
			setError: (message) => errors.push(message),
		});

		expect(checkbox.checked).toBe(false);
		expect(errors.at(-1)).toBe('Não foi possível atualizar o cadastro. Tente novamente.');
	});
});
