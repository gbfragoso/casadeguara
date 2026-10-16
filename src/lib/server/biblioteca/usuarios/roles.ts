import { parseRoles } from '#lib/server/authorization/cadastros.js';

const LIBRARY_ROLES = ['biblioteca', 'biblioteca:admin'];
const ADMIN_ROLE_SUFFIX = ':admin';

const isLibraryRole = (role: string) => LIBRARY_ROLES.includes(role);

const listOtherAreaRoles = (roles: string) => parseRoles(roles).filter((role) => !isLibraryRole(role));

export const hasOnlyLibraryRoles = (roles: string) => {
	const parsedRoles = parseRoles(roles);

	return parsedRoles.length > 0 && parsedRoles.every(isLibraryRole);
};

export const selectLibraryRoles = (roles: string) => parseRoles(roles).filter(isLibraryRole).join(',');

export const replaceLibraryRoles = (currentRoles: string, libraryRoles: string) =>
	[...parseRoles(libraryRoles), ...listOtherAreaRoles(currentRoles)].join(',');

export const administersOtherAreasOf = (editor: { roles: string }, target: { roles: string }) => {
	const editorRoles = parseRoles(editor.roles);

	return listOtherAreaRoles(target.roles)
		.filter((role) => role.endsWith(ADMIN_ROLE_SUFFIX))
		.every((role) => editorRoles.includes(role));
};
