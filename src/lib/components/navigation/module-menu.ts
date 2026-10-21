import type { ResolvedPathname } from '$app/types';

export type ModuleMenuItem = {
	href: ResolvedPathname;
	label: string;
	title: string;
	ariaLabel: string;
	icon: string;
	match: 'exact' | 'prefix';
	adminOnly?: boolean;
};

export function isMenuItemActive(
	url: Pick<URL, 'href' | 'pathname'>,
	item: { href: string; match: ModuleMenuItem['match'] },
) {
	const itemPathname = new URL(item.href, url.href).pathname;
	if (url.pathname === itemPathname) return true;
	return item.match === 'prefix' && url.pathname.startsWith(`${itemPathname}/`);
}

export function visibleMenuItems(items: readonly ModuleMenuItem[], isAdmin: boolean) {
	return items.filter((item) => isAdmin || !item.adminOnly);
}
