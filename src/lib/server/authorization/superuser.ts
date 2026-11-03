import { requireAuthenticatedUser } from '#lib/server/authorization/authenticated-user.js';
import { parseRoles } from '#lib/server/authorization/cadastros.js';
import { SUPERUSER_ROLE } from '#lib/users/access.js';
import { error } from '@sveltejs/kit';

type RolesHolder = { roles: string };

export const hasSuperuserAccess = (user: RolesHolder | null | undefined) =>
	user ? parseRoles(user.roles).includes(SUPERUSER_ROLE) : false;

export const requireSuperuserAccess = <User extends RolesHolder>(user: User | null | undefined): User => {
	const authenticatedUser = requireAuthenticatedUser(user);
	if (!hasSuperuserAccess(authenticatedUser)) {
		error(403, 'Usuário não possui acesso à gestão de usuários.');
	}

	return authenticatedUser;
};
