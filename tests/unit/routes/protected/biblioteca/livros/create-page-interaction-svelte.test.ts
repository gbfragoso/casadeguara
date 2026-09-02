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

const getElement = <ElementType extends Element>(target: Element, selector: string): ElementType => {
	const element = target.querySelector<ElementType>(selector);
	if (!element) throw new Error(`Elemento não encontrado: ${selector}`);
	return element;
};

const fill = async (input: HTMLInputElement, value: string) => {
	input.value = value;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	await tick();
};

const select = async (input: HTMLSelectElement, value: string) => {
	for (const option of input.options) option.selected = option.value === value;
	input.dispatchEvent(new Event('change', { bubbles: true }));
	await tick();
};

const click = async (button: HTMLButtonElement) => {
	button.click();
	await tick();
};

const findButton = (target: Element, label: string) => {
	const button = [...target.querySelectorAll<HTMLButtonElement>('button')].find((item) =>
		item.textContent?.includes(label),
	);
	if (!button) throw new Error(`Botão não encontrado: ${label}`);
	return button;
};

const fillRequiredBookData = async (target: Element) => {
	await fill(getElement(target, 'input[name="tombo"]'), '12345678');
	await fill(getElement(target, 'input[name="titulo"]'), 'Livro completo');
	await select(getElement(target, 'select[name="editora"]'), '3');
	await select(getElement(target, 'select[name="colecao"]'), '5');
};

describe('new book stepper', () => {
	let component: ReturnType<typeof mount> | undefined;

	afterEach(async () => {
		if (component) await unmount(component);
		document.body.replaceChildren();
	});

	it('guides required data, author selection, and review without losing values', async () => {
		const target = document.body.appendChild(document.createElement('div'));
		component = mount(Page, { target, props: { data, form: null } });
		await tick();
		const fieldsets = target.querySelectorAll('fieldset');
		const nextAuthors = getElement<HTMLButtonElement>(target, 'button:nth-of-type(1)');

		await click(nextAuthors);
		expect(fieldsets[0].classList).not.toContain('is-hidden');
		await fillRequiredBookData(target);
		await click(nextAuthors);
		expect(fieldsets[1].classList).not.toContain('is-hidden');

		const nextReview = findButton(target, 'Próximo: revisão');
		await click(nextReview);
		expect(target.textContent).toContain('Selecione ou cadastre ao menos um autor.');
		await fill(getElement(target, 'input[name="novoAutor"]'), 'Novo Autor');
		await click(nextReview);

		expect(fieldsets[2].classList).not.toContain('is-hidden');
		expect(fieldsets[2].textContent).toContain('Livro completo');
		expect(fieldsets[2].textContent).toContain('Novo Autor (novo)');
		expect(fieldsets[2].textContent).toContain('nº 1 — Disponível');
		await click(getElement(target, 'fieldset:nth-of-type(3) button[type="button"]'));
		expect(fieldsets[1].classList).not.toContain('is-hidden');
		await click(getElement(target, 'fieldset:nth-of-type(2) button:first-of-type'));
		expect(fieldsets[0].classList).not.toContain('is-hidden');
	});

	it('restores existing selections in the review after server validation', async () => {
		const target = document.body.appendChild(document.createElement('div'));
		component = mount(Page, {
			target,
			props: {
				data,
				form: {
					values: {
						tombo: '12345678',
						titulo: 'Livro preservado',
						editora: '3',
						colecao: '5',
						autores: ['7'],
					},
				},
			},
		});
		await tick();

		await click(getElement(target, 'button:nth-of-type(1)'));
		await click(findButton(target, 'Próximo: revisão'));

		const review = target.querySelectorAll('fieldset')[2];
		expect(review.textContent).toContain('Editora A');
		expect(review.textContent).toContain('Coleção A');
		expect(review.textContent).toContain('Autor A');
	});
});
