import { parseRoles } from '#lib/server/authorization/cadastros.js';
import { requireAuthenticatedUser } from '#lib/server/authorization/authenticated-user.js';
import { error } from '@sveltejs/kit';

type RolesHolder = { roles: string };

const COMUNICACAO_ROLE = 'comunicacao';
const COMUNICACAO_ADMIN_ROLE = 'comunicacao:admin';

const hasRole = (user: RolesHolder, role: string) => parseRoles(user.roles).includes(role);

export const hasComunicacaoAccess = (user: RolesHolder) =>
	hasRole(user, COMUNICACAO_ROLE) || hasRole(user, COMUNICACAO_ADMIN_ROLE);

export const hasComunicacaoAdminAccess = (user: RolesHolder) => hasRole(user, COMUNICACAO_ADMIN_ROLE);

export const requireComunicacaoAccess = <User extends RolesHolder>(user: User | null | undefined): User => {
	const authenticatedUser = requireAuthenticatedUser(user);
	if (!hasComunicacaoAccess(authenticatedUser)) {
		error(403, 'Usuário não possui acesso ao sistema da comunicação.');
	}

	return authenticatedUser;
};

export const requireComunicacaoAdminAccess = <User extends RolesHolder>(user: User | null | undefined): User => {
	const authorizedUser = requireComunicacaoAccess(user);
	if (!hasComunicacaoAdminAccess(authorizedUser)) {
		error(403, 'Usuário não possui acesso administrativo à comunicação.');
	}

	return authorizedUser;
};
