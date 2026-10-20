// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import Breadcrumb from '#lib/components/navigation/Breadcrumb.svelte';
import { getElement, renderComponent } from '../support/render-component.js';

describe('Breadcrumb', () => {
	it('marks only the last item as the current page', async () => {
		const target = await renderComponent(Breadcrumb, {
			id: 'breadcrumb',
			items: [
				{ label: 'Biblioteca', href: '/biblioteca' },
				{ label: 'Empréstimos', href: '/biblioteca/emprestimos' },
				{ label: 'Recibo', href: '/biblioteca/emprestimos/7' },
			],
		});

		const nav = getElement(target, 'nav#breadcrumb[aria-label="breadcrumbs"]', HTMLElement);
		const links = [...nav.querySelectorAll('a')].map((link) => [
			link.textContent,
			link.getAttribute('aria-current'),
		]);
		expect(links).toEqual([
			['Biblioteca', null],
			['Empréstimos', null],
			['Recibo', 'page'],
		]);
	});
});
