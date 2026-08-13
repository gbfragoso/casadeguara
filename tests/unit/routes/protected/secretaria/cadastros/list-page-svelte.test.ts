import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';

import { updateCadastroFlag } from '../../../../../../src/routes/(protected)/secretaria/cadastros/cadastro-flag';
import Page from '../../../../../../src/routes/(protected)/secretaria/cadastros/+page.svelte';

describe('secretaria registration list page', () => {
	it('retains search values and renders accessible errors, empty states, and keyed results', () => {
		const { body: invalid } = render(Page, {
			props: {
				form: {
					values: { nome: 'Maria', trabalhadores: 'true' },
					errors: { nome: ['Nome do trabalhador inválido.'] },
				},
			},
		});
		const { body: empty } = render(Page, {
			props: { form: { cadastros: [], values: { nome: '', trabalhadores: 'false' } } },
		});
		const { body: results } = render(Page, {
			props: {
				form: {
					cadastros: [{ idleitor: 4, nome: 'MARIA', trab: true, frequencia: false, desencarnado: false }],
					values: { nome: '', trabalhadores: 'false' },
				},
			},
		});

		expect(invalid).toContain('value="Maria"');
		expect(invalid).toContain('name="trabalhadores" id="trabalhadores" value="true" checked');
		expect(invalid).toContain('aria-describedby="nome-errors"');
		expect(invalid).toContain('Nome do trabalhador inválido.');
		expect(empty).toContain('Nenhum cadastro encontrado.');
		expect(results).toContain('aria-label="Marcar MARIA como trabalhador"');
		expect(results).toContain('aria-label="Editar cadastro de MARIA"');
	});

	it('keeps only the affected flag pending and rolls it back with a visible Portuguese error', async () => {
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
