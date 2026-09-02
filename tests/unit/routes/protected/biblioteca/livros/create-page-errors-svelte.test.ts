// @vitest-environment happy-dom

import { mount, tick, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/livros/novo/+page.svelte';

vi.mock('$lib/forms/enhancer.svelte', () => ({
	createFormEnhancer: () => ({ loading: false, submitWithLoading: () => undefined }),
}));

const data = {
	editoras: [{ ideditora: 3, nome: 'Editora A' }],
	colecoes: [{ idserie: 5, nome: 'Coleção A' }],
	autores: [{ idautor: 7, nome: 'Autor A' }],
};

const form = {
	values: { tombo: '12345678', titulo: 'Livro', editora: '3', colecao: '5', autores: ['7'] },
	errors: {
		tombo: ['Erro no tombo.'],
		titulo: ['Erro no título.'],
		editora: ['Erro na editora.'],
		colecao: ['Erro na coleção.'],
		ordem: ['Erro na ordem.'],
		autores: ['Erro nos autores.'],
		novoAutor: ['Erro no novo autor.'],
	},
	message: 'Falha ao cadastrar um novo livro.',
};

describe('new book errors', () => {
	let component: ReturnType<typeof mount> | undefined;

	afterEach(async () => {
		if (component) await unmount(component);
		document.body.replaceChildren();
	});

	it('keeps all server errors visible through the guided correction flow', async () => {
		const target = document.body.appendChild(document.createElement('div'));
		component = mount(Page, { target, props: { data, form } });
		await tick();
		const buttons = () => [...target.querySelectorAll<HTMLButtonElement>('button')];

		expect(target.textContent).toContain('Erro no tombo.');
		expect(target.textContent).toContain('Erro no novo autor.');
		expect(target.textContent).toContain(form.message);
		buttons()
			.find((button) => button.textContent?.includes('Próximo: autores'))
			?.click();
		await tick();
		buttons()
			.find((button) => button.textContent?.includes('Próximo: revisão'))
			?.click();
		await tick();

		expect(target.querySelector('[role="alert"]')?.textContent).toContain('não foi concluído');
	});
});
