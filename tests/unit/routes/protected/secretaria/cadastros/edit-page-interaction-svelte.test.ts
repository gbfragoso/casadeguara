// @vitest-environment happy-dom
import { mount, tick, unmount, type ComponentProps } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.svelte';

vi.mock('$app/forms', () => ({ enhance: vi.fn() }));

const trabalhador = {
	nome: 'MARIA',
	rgMask: null,
	cpfMask: null,
	email: null,
	celular: null,
	telefone: null,
	logradouro: null,
	bairro: null,
	complemento: null,
	cidade: null,
	cep: null,
	aniversario: null,
	trab: true,
	hasPhoto: true,
	photoVersion: 'v1',
};

let mounted: ReturnType<typeof mount> | undefined;

afterEach(async () => {
	if (mounted) await unmount(mounted);
	mounted = undefined;
	document.body.replaceChildren();
});

type PageForm = ComponentProps<typeof Page>['form'];

const mountPage = (form: PageForm = null) => {
	const target = document.createElement('div');
	document.body.append(target);
	mounted = mount(Page, { target, props: { data: { id: 4, trabalhador }, form } });
	return target;
};

describe('edit secretaria registration page interactions', () => {
	it('shows the validation errors returned by an enhanced submission', () => {
		const target = mountPage({ values: { rg: '', cpf: '' }, errors: { cpf: ['CPF inválido.'] } });

		const errors = target.querySelector('#cpf-errors');

		expect(errors?.textContent).toBe('CPF inválido.');
	});

	it('shows the update success notice returned by an enhanced submission', () => {
		const target = mountPage({ status: 200 });

		const text = target.textContent;

		expect(text).toContain('Trabalhador atualizado com sucesso!');
	});

	it('opens the reframe editor with the current original photo', async () => {
		const target = mountPage();
		const trigger = target.querySelector('#reenquadrar-foto');
		if (!(trigger instanceof HTMLButtonElement)) throw new Error('Reframing trigger was not rendered.');

		trigger.click();
		await tick();

		expect(target.querySelector('.photo-cropper img')?.getAttribute('src')).toBe(
			'/secretaria/cadastros/4/foto/original?versao=v1',
		);
	});
});
