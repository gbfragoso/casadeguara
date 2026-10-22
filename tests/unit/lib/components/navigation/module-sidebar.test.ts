// @vitest-environment happy-dom
import { tick } from 'svelte';
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
	return renderComponent(ModuleSidebar, { items: ITEMS, moduleName: 'Tesouraria', isAdmin, expanded: false });
};

const readLinks = (target: HTMLElement) =>
	[...getElement(target, '[data-testid="regiao-menu-lateral"]', HTMLElement).querySelectorAll('a')].map((link) => ({
		label: link.textContent.trim(),
		title: link.title,
		ariaLabel: link.getAttribute('aria-label'),
		current: link.getAttribute('aria-current'),
	}));

describe('ModuleSidebar', () => {
	it('names the Casa and the current module above the menu', async () => {
		const target = await renderSidebar('/tesouraria', false);

		const identity = getElement(target, '[data-testid="regiao-menu-lateral"] p', HTMLParagraphElement);

		expect([...identity.children].map((line) => line.textContent.trim())).toEqual(['Casa de Guará', 'Tesouraria']);
	});

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

	it('requests to close the expanded drawer when the backdrop is tapped', async () => {
		const onClose = vi.fn();
		const target = await renderComponent(ModuleSidebar, {
			items: ITEMS,
			moduleName: 'Tesouraria',
			isAdmin: false,
			expanded: true,
			onClose,
		});

		getElement(target, '[data-testid="fundo-menu-lateral"]', HTMLDivElement).click();
		await tick();

		expect(onClose).toHaveBeenCalledOnce();
	});

	it('shows no backdrop while the drawer is collapsed', async () => {
		const target = await renderSidebar('/tesouraria', false);

		expect(target.querySelector('[data-testid="fundo-menu-lateral"]')).toBeNull();
	});
});
