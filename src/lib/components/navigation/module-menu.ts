export type ModuleMenuItem = {
	href: string;
	label: string;
	title: string;
	ariaLabel: string;
	icon: string;
	match: 'exact' | 'prefix';
	adminOnly?: boolean;
};

export function isMenuItemActive(pathname: string, item: Pick<ModuleMenuItem, 'href' | 'match'>) {
	if (pathname === item.href) return true;
	return item.match === 'prefix' && pathname.startsWith(`${item.href}/`);
}

export function visibleMenuItems(items: readonly ModuleMenuItem[], isAdmin: boolean) {
	return items.filter((item) => isAdmin || !item.adminOnly);
}
