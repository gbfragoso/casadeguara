import { SYSTEM_MODULES, type SystemModulePath } from '#lib/navigation/system-modules.js';
import { parseRoles } from '#lib/server/authorization/cadastros.js';
import {
	ACCESS_LEVEL_LABELS,
	SUPERUSER_ROLE,
	mapSystemModules,
	type AccessLevel,
	type UserAccess,
} from '#lib/users/access.js';

export { hasAnyAccess, type ModuleAccess, type UserAccess } from '#lib/users/access.js';

const ADMIN_ROLE_SUFFIX = ':admin';
const SUPERUSER_LABEL = 'Superusuário';

const toCoordinationRole = (module: SystemModulePath) => `${module}${ADMIN_ROLE_SUFFIX}`;

const KNOWN_ROLES = new Set([
	...SYSTEM_MODULES.flatMap(({ path }) => [path, toCoordinationRole(path)]),
	SUPERUSER_ROLE,
]);

const readModuleLevel = (roles: readonly string[], module: SystemModulePath): AccessLevel => {
	if (roles.includes(toCoordinationRole(module))) return 'coordination';

	return roles.includes(module) ? 'volunteer' : 'none';
};

const listModuleRoles = (module: SystemModulePath, level: AccessLevel) => {
	if (level === 'coordination') return [toCoordinationRole(module)];

	return level === 'volunteer' ? [module] : [];
};

export const readUserAccess = (roles: string): UserAccess => {
	const parsedRoles = parseRoles(roles);

	return {
		modules: mapSystemModules((module) => readModuleLevel(parsedRoles, module)),
		superuser: parsedRoles.includes(SUPERUSER_ROLE),
	};
};

export const buildRoles = (access: UserAccess, currentRoles = '') => {
	const chosenRoles = SYSTEM_MODULES.flatMap(({ path }) => listModuleRoles(path, access.modules[path]));
	const superuserRoles = access.superuser ? [SUPERUSER_ROLE] : [];
	const unknownRoles = parseRoles(currentRoles).filter((role) => !KNOWN_ROLES.has(role));

	return [...new Set([...chosenRoles, ...superuserRoles, ...unknownRoles])].join(',');
};

export const summarizeAccess = (roles: string) => {
	const { modules, superuser } = readUserAccess(roles);
	const moduleItems = SYSTEM_MODULES.filter(({ path }) => modules[path] !== 'none').map(
		({ path, label }) => `${label}: ${ACCESS_LEVEL_LABELS[modules[path]]}`,
	);
	const items = superuser ? [...moduleItems, SUPERUSER_LABEL] : moduleItems;

	return items.length > 0 ? items.join(', ') : ACCESS_LEVEL_LABELS.none;
};
