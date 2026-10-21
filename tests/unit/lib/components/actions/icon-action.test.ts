// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

import IconAction from '#lib/components/actions/IconAction.svelte';
import { getElement, renderComponent } from '../support/render-component.js';

describe('IconAction', () => {
	it('renders a labelled link with a decorative icon when href is given', async () => {
		const target = await renderComponent(IconAction, {
			href: '/biblioteca/autores/7',
			icon: 'fa-regular fa-pen-to-square',
			'aria-label': 'Editar autor CONCEIÇÃO EVARISTO',
		});

		const link = getElement(target, 'a', HTMLAnchorElement);

		expect(link.getAttribute('href')).toBe('/biblioteca/autores/7');
		expect(link.getAttribute('aria-label')).toBe('Editar autor CONCEIÇÃO EVARISTO');
		expect(link.querySelector('i')?.getAttribute('aria-hidden')).toBe('true');
		expect(link.textContent).toBe('');
	});

	it('renders a non-submitting button with the forwarded attributes', async () => {
		const onclick = vi.fn();
		const target = await renderComponent(IconAction, {
			icon: 'fa-regular fa-trash-can',
			tone: 'danger',
			title: 'Excluir',
			'aria-label': 'Excluir livro Caminhos da Luz',
			onclick,
		});

		const button = getElement(target, 'button', HTMLButtonElement);
		button.click();

		expect(button.type).toBe('button');
		expect(button.title).toBe('Excluir');
		expect(onclick).toHaveBeenCalledOnce();
	});

	it('keeps an explicit submit type', async () => {
		const target = await renderComponent(IconAction, {
			type: 'submit',
			icon: 'fa-solid fa-xmark',
			'aria-label': 'Remover',
		});

		expect(getElement(target, 'button', HTMLButtonElement).type).toBe('submit');
	});
});
