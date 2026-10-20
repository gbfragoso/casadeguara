import { mount, tick, unmount, type Component } from 'svelte';

export type SidebarLink = { label: string; title: string; ariaLabel: string | null };
export type ModuleLayoutData = { username: string; userid: string; isAdmin: boolean };

const MOUNTED_LAYOUTS: ReturnType<typeof mount>[] = [];

export const mountModuleLayout = async (layout: Component<never>, data: ModuleLayoutData) => {
	const target = document.createElement('div');
	document.body.append(target);
	MOUNTED_LAYOUTS.push(mount(layout as Component<{ data: ModuleLayoutData }>, { target, props: { data } }));
	await tick();
	return target;
};

export const unmountModuleLayouts = () => {
	MOUNTED_LAYOUTS.splice(0).forEach((mounted) => unmount(mounted));
	document.body.replaceChildren();
};

const getSidebar = (target: HTMLElement) => {
	const sidebar = target.querySelector('[data-testid="regiao-menu-lateral"]');
	if (!(sidebar instanceof HTMLElement)) throw new Error('Sidebar region was not rendered.');
	return sidebar;
};

const getSidebarAnchors = (target: HTMLElement) => [...getSidebar(target).querySelectorAll('a')];

const describeLink = (anchor: HTMLAnchorElement): SidebarLink => ({
	label: anchor.textContent.trim(),
	title: anchor.title,
	ariaLabel: anchor.getAttribute('aria-label'),
});

export const readSidebarLinks = (target: HTMLElement) => getSidebarAnchors(target).map(describeLink);

export const readCurrentSidebarLinks = (target: HTMLElement) =>
	getSidebarAnchors(target)
		.filter((anchor) => anchor.getAttribute('aria-current') === 'page')
		.map((anchor) => anchor.textContent.trim());

export const getMenuButton = (target: HTMLElement) => {
	const button = target.querySelector('[data-testid="regiao-barra-superior"] button[aria-label="menu"]');
	if (!(button instanceof HTMLButtonElement)) throw new Error('Menu button was not rendered.');
	return button;
};
