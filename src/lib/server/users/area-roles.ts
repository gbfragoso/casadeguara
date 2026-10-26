import { parseRoles } from '#lib/server/authorization/cadastros.js';

const ADMIN_ROLE_SUFFIX = ':admin';

type RolesHolder = { roles: string };

export const createAreaRoles = (areaRoles: readonly string[]) => {
	const isAreaRole = (role: string) => areaRoles.includes(role);
	const listOtherAreaRoles = (roles: string) => parseRoles(roles).filter((role) => !isAreaRole(role));

	const hasOnly = (roles: string) => {
		const parsedRoles = parseRoles(roles);

		return parsedRoles.length > 0 && parsedRoles.every(isAreaRole);
	};

	const administersOtherAreasOf = (editor: RolesHolder, target: RolesHolder) => {
		const editorRoles = parseRoles(editor.roles);

		return listOtherAreaRoles(target.roles)
			.filter((role) => role.endsWith(ADMIN_ROLE_SUFFIX))
			.every((role) => editorRoles.includes(role));
	};

	return {
		areaRoles,
		select: (roles: string) => parseRoles(roles).filter(isAreaRole).join(','),
		replace: (currentRoles: string, newAreaRoles: string) =>
			[...parseRoles(newAreaRoles), ...listOtherAreaRoles(currentRoles)].join(','),
		hasOnly,
		includesAny: (roles: string) => parseRoles(roles).some(isAreaRole),
		administersOtherAreasOf,
	};
};

export type AreaRoles = ReturnType<typeof createAreaRoles>;

export const LIBRARY_AREA = createAreaRoles(['biblioteca', 'biblioteca:admin']);
export const SECRETARIA_AREA = createAreaRoles(['secretaria', 'secretaria:admin', 'tesouraria', 'tesouraria:admin']);
export const COMUNICACAO_AREA = createAreaRoles(['comunicacao', 'comunicacao:admin']);
