import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/leitores/[id=integer]/+page.svelte';

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

		expect(body).toContain('RG cadastrado: 12.***.***-89');
		expect(body).toContain('CPF cadastrado: 123.***.***-09');
		expect(body).toContain('name="rg" id="rg" value=""');
		expect(body).toContain('name="cpf" id="cpf" value=""');
		expect(body).toContain('Remover RG cadastrado');
		expect(body).toContain('Remover CPF cadastrado');
		expect(body).not.toContain('12345678909');
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

		expect(body).toContain('value="" autocomplete="name"');
		expect(body).toContain('value="bad" maxlength="60" autocomplete="email"');
		expect(body).toContain('aria-describedby="nome-errors"');
		expect(body).toContain('aria-describedby="email-errors"');
		expect(body).toContain('Nome do leitor é obrigatório.');
		expect(body).toContain('E-mail inválido.');
		expect(body).toContain('name="removeCpf" id="removeCpf" value="true" checked');
	});

	it('renders update success only for status 200', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });

		expect(body).toContain('Leitor atualizado com sucesso!');
	});
});
