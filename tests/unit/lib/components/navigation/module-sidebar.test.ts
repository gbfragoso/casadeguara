// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

const pageState = vi.hoisted(() => ({ url: new URL('http://localhost/tesouraria') }));
vi.mock('$app/state', () => ({ page: pageState }));

import ModuleSidebar from '#lib/components/navigation/ModuleSidebar.svelte';
import type { ModuleMenuItem } from '#lib/components/navigation/module-menu.js';
import { getElement, renderComponent } from '../support/render-component.js';

const ITEMS: readonly ModuleMenuItem[] = [
	{
		href: '/tesouraria',
		label: 'Início',
		title: 'Página Inicial',
		ariaLabel: 'home',
		icon: 'fa-solid fa-house',
		match: 'exact',
	},
	{
		href: '/tesouraria/lancamentos',
		label: 'Lançamentos',
		title: 'Lançamentos',
		ariaLabel: 'lançamentos',
		icon: 'fa-solid fa-wallet',
		match: 'prefix',
	},
	{
		href: '/tesouraria/caixa',
		label: 'Caixa',
		title: 'Caixa',
		ariaLabel: 'caixa',
		icon: 'fa-solid fa-cash-register',
		match: 'prefix',
		adminOnly: true,
	},
];

const renderSidebar = (pathname: string, isAdmin: boolean) => {
	pageState.url = new URL(`http://localhost${pathname}`);
	return renderComponent(ModuleSidebar, { items: ITEMS, isAdmin, expanded: false });
};

const readLinks = (target: HTMLElement) =>
	[...getElement(target, '[data-testid="regiao-menu-lateral"]', HTMLElement).querySelectorAll('a')].map((link) => ({
		label: link.textContent.trim(),
		title: link.title,
		ariaLabel: link.getAttribute('aria-label'),
		current: link.getAttribute('aria-current'),
	}));

describe('ModuleSidebar', () => {
	it('marks only the link that matches the current path', async () => {
		const target = await renderSidebar('/tesouraria/lancamentos/12/estorno', true);

		const current = readLinks(target).filter((link) => link.current === 'page');

		expect(current.map((link) => link.label)).toEqual(['Lançamentos']);
	});

	it('shows the administrative items with their current labels to administrators', async () => {
		const target = await renderSidebar('/tesouraria', true);

		const links = readLinks(target);

		expect(links.map(({ label, title, ariaLabel }) => ({ label, title, ariaLabel }))).toEqual([
			{ label: 'Início', title: 'Página Inicial', ariaLabel: 'home' },
			{ label: 'Lançamentos', title: 'Lançamentos', ariaLabel: 'lançamentos' },
			{ label: 'Caixa', title: 'Caixa', ariaLabel: 'caixa' },
		]);
	});

	it('hides the administrative items from regular users', async () => {
		const target = await renderSidebar('/tesouraria', false);

		const labels = readLinks(target).map((link) => link.label);

		expect(labels).toEqual(['Início', 'Lançamentos']);
	});

	it('hides the item icons from assistive technology', async () => {
		const target = await renderSidebar('/tesouraria', true);

		const icons = [...target.querySelectorAll('nav i')];

		expect(icons.map((icon) => icon.getAttribute('aria-hidden'))).toEqual(['true', 'true', 'true']);
	});
});
