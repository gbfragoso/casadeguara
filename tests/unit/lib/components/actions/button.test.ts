// @vitest-environment happy-dom
import { createAttachmentKey } from 'svelte/attachments';
import { describe, expect, it, vi } from 'vitest';

import Button from '#lib/components/actions/Button.svelte';
import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
import { getElement, htmlSnippet, renderComponent } from '../support/render-component.js';

describe('Button', () => {
	it('renders a link when href is given', async () => {
		const target = await renderComponent(Button, {
			href: '/biblioteca/livros/novo',
			children: htmlSnippet('<span>Novo</span>'),
		});

		const link = getElement(target, 'a', HTMLAnchorElement);

		expect(link.getAttribute('href')).toBe('/biblioteca/livros/novo');
		expect(link.textContent).toBe('Novo');
		expect(target.querySelector('button')).toBeNull();
	});

	it('renders a button with the forwarded type, label and attachment', async () => {
		const attach = vi.fn();

		const target = await renderComponent(Button, {
			type: 'submit',
			'aria-label': 'Confirmar exclusão do livro Caminhos da Luz',
			[createAttachmentKey()]: attach,
			children: htmlSnippet('<span>Excluir</span>'),
		});

		const button = getElement(target, 'button', HTMLButtonElement);
		expect(button.type).toBe('submit');
		expect(button.getAttribute('aria-label')).toBe('Confirmar exclusão do livro Caminhos da Luz');
		expect(attach).toHaveBeenCalledWith(button);
	});

	it('shows the loading indicator while keeping the label', async () => {
		const target = await renderComponent(Button, {
			type: 'submit',
			loading: true,
			children: htmlSnippet('<span>Cadastrar</span>'),
		});

		const button = getElement(target, 'button', HTMLButtonElement);

		expect(button.getAttribute('aria-busy')).toBe('true');
		expect(button.disabled).toBe(true);
		expect(button.textContent?.trim()).toBe('Cadastrar');
		expect(button.querySelector('[aria-hidden="true"]')).not.toBeNull();
	});

	it('reports a finished loading state as not busy', async () => {
		const target = await renderComponent(Button, {
			type: 'submit',
			loading: false,
			children: htmlSnippet('<span>Cadastrar</span>'),
		});

		const button = getElement(target, 'button', HTMLButtonElement);

		expect(button.getAttribute('aria-busy')).toBe('false');
		expect(button.disabled).toBe(false);
		expect(button.querySelector('[aria-hidden="true"]')).toBeNull();
	});

	it.each([
		{ tone: 'primary', fullwidth: true },
		{ tone: 'warning', rounded: true, size: 'small' },
		{ tone: 'danger' },
		{ tone: 'success' },
		{ tone: 'light' },
		{ tone: 'ghost' },
		{ tone: 'link' },
	] as const)('keeps the label and loading state with the style %o', async (style) => {
		const target = await renderComponent(Button, {
			...style,
			type: 'submit',
			loading: true,
			children: htmlSnippet('<span>Renovar</span>'),
		});

		const button = getElement(target, 'button', HTMLButtonElement);

		expect(button.textContent?.trim()).toBe('Renovar');
		expect(button.getAttribute('aria-busy')).toBe('true');
	});

	it('omits aria-busy when loading is not tracked', async () => {
		const target = await renderComponent(Button, {
			type: 'button',
			disabled: true,
			children: htmlSnippet('<span>Cadastrar</span>'),
		});

		const button = getElement(target, 'button', HTMLButtonElement);

		expect(button.hasAttribute('aria-busy')).toBe(false);
		expect(button.disabled).toBe(true);
	});
});

describe('ButtonGroup', () => {
	it('groups the buttons in one element with the forwarded attributes', async () => {
		const target = await renderComponent(ButtonGroup, {
			align: 'between',
			'data-testid': 'acoes',
			children: htmlSnippet('<div><button>Voltar</button><button>Salvar</button></div>'),
		});

		const group = getElement(target, '[data-testid="acoes"]', HTMLDivElement);

		expect(group.querySelectorAll('button')).toHaveLength(2);
	});
});
