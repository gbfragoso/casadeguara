import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/leitores/[id=integer]/+page.svelte';
import { getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

const data = {
	leitor: {
		nome: 'MARIA',
		rgMask: '12.***.***-89',
		cpfMask: '123.***.***-09',
		email: 'maria@example.com',
		celular: null,
		telefone: null,
		logradouro: null,
		bairro: null,
		complemento: null,
		cidade: null,
		cep: null,
		trab: false,
		status: true,
	},
};

describe('edit reader page', () => {
	it('shows masks separately while keeping identifier replacement inputs blank', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });
		const document = parseRenderedBody(body);
		const rg = getRenderedInput(document, 'input[name="rg"]');
		const cpf = getRenderedInput(document, 'input[name="cpf"]');

		expect(document.body.textContent).toContain('RG cadastrado: 12.***.***-89');
		expect(document.body.textContent).toContain('CPF cadastrado: 123.***.***-09');
		expect(rg.value).toBe('');
		expect(cpf.value).toBe('');
		expect(document.querySelector('label[for="removeRg"]')?.textContent).toContain('Remover RG cadastrado');
		expect(document.querySelector('label[for="removeCpf"]')?.textContent).toContain('Remover CPF cadastrado');
		expect(document.body.textContent).not.toContain('12345678909');
	});

	it('keeps safe submitted values and renders associated errors', () => {
		const { body } = render(Page, {
			props: {
				data,
				form: {
					values: { nome: '', email: 'bad', cpf: '', rg: '', removeCpf: 'true' },
					errors: { nome: ['Nome do leitor é obrigatório.'], email: ['E-mail inválido.'] },
				},
			},
		});
		const document = parseRenderedBody(body);
		const nome = getRenderedInput(document, 'input[name="nome"]');
		const email = getRenderedInput(document, 'input[name="email"]');
		const removeCpf = getRenderedInput(document, 'input[name="removeCpf"]');

		expect(nome.value).toBe('');
		expect(nome.autocomplete).toBe('name');
		expect(email.value).toBe('bad');
		expect(email.autocomplete).toBe('email');
		expect(nome.getAttribute('aria-describedby')).toBe('nome-errors');
		expect(email.getAttribute('aria-describedby')).toBe('email-errors');
		expect(document.querySelectorAll('#nome-errors p, #email-errors p')).toHaveLength(2);
		expect(removeCpf.checked).toBe(true);
	});

	it('renders update success for status 200', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });
		const document = parseRenderedBody(body);

		expect(document.body.textContent).toContain('Leitor atualizado com sucesso!');
	});
});
