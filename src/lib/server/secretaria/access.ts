import { hasSecretariaAccess, parseRoles } from '#lib/server/authorization/cadastros.js';
import { requireAuthenticatedUser } from '#lib/server/authorization/authenticated-user.js';
import { error } from '@sveltejs/kit';

type SecretariaUser = { id: string; roles: string } | null | undefined;

const SECRETARIA_ADMIN_ROLE = 'secretaria:admin';

export const requireSecretariaAccess = (user: SecretariaUser) => {
	const authenticatedUser = requireAuthenticatedUser(user);
	if (!hasSecretariaAccess(authenticatedUser)) {
		error(401, 'Usuário não possui acesso ao sistema da secretaria.');
	}

	return authenticatedUser;
};

export const requireSecretariaAdminAccess = (user: SecretariaUser) => {
	const authorizedUser = requireSecretariaAccess(user);
	if (!parseRoles(authorizedUser.roles).includes(SECRETARIA_ADMIN_ROLE)) {
		error(401, 'Usuário não possui acesso administrativo à secretaria.');
	}

	return authorizedUser;
};
