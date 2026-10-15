import { hasSecretariaAccess, parseRoles } from '#lib/server/authorization/cadastros.js';
import { error, redirect } from '@sveltejs/kit';

type SecretariaUser = { id: string; roles: string } | null | undefined;

const SECRETARIA_ADMIN_ROLE = 'secretaria:admin';

export const requireSecretariaAccess = (user: SecretariaUser) => {
	if (!user) redirect(302, '/');
	if (!hasSecretariaAccess(user)) {
		error(401, 'Usuário não possui acesso ao sistema da secretaria.');
	}

	return user;
};

export const requireSecretariaAdminAccess = (user: SecretariaUser) => {
	const authorizedUser = requireSecretariaAccess(user);
	if (!parseRoles(authorizedUser.roles).includes(SECRETARIA_ADMIN_ROLE)) {
		error(401, 'Usuário não possui acesso administrativo à secretaria.');
	}

	return authorizedUser;
};
