export type SystemModulePath = 'biblioteca' | 'secretaria' | 'tesouraria' | 'comunicacao';
export type SystemModule = { role: SystemModulePath; path: SystemModulePath; label: string; icon: string };

const ADMIN_ROLE_SUFFIX = ':admin';
const MODULE_SELECTION_PATH = '/sistemas';

export const SYSTEM_MODULES: readonly SystemModule[] = [
	{ role: 'biblioteca', path: 'biblioteca', label: 'Biblioteca', icon: 'fa-solid fa-book' },
	{ role: 'secretaria', path: 'secretaria', label: 'Secretaria', icon: 'fa-solid fa-address-book' },
	{ role: 'tesouraria', path: 'tesouraria', label: 'Tesouraria', icon: 'fa-solid fa-sack-dollar' },
	{ role: 'comunicacao', path: 'comunicacao', label: 'Comunicação', icon: 'fa-solid fa-bullhorn' },
];

const toModuleRole = (role: string) => {
	const trimmedRole = role.trim();

	return trimmedRole.endsWith(ADMIN_ROLE_SUFFIX) ? trimmedRole.slice(0, -ADMIN_ROLE_SUFFIX.length) : trimmedRole;
};

export const listAccessibleModules = (roles: readonly string[]) => {
	const moduleRoles = new Set(roles.map(toModuleRole));

	return SYSTEM_MODULES.filter((module) => moduleRoles.has(module.role));
};

export const resolveLoginDestination = (roles: string): `/${string}` | null => {
	const modules = listAccessibleModules(roles.split(','));
	if (modules.length === 0) return null;

	return modules.length === 1 ? `/${modules[0].path}` : MODULE_SELECTION_PATH;
};
