import { error } from '@sveltejs/kit';

import { requireAuthenticatedUser } from './authenticated-user';
import { parseRoles } from './cadastros';

export type TesourariaUser = { roles: string } | null | undefined;
export type TesourariaAccess = 'authorized' | 'unauthenticated' | 'unauthorized';

const TESOURARIA_ROLE = 'tesouraria';
const TESOURARIA_ADMIN_ROLE = 'tesouraria:admin';

const hasRole = (user: TesourariaUser, role: string) => (user ? parseRoles(user.roles).includes(role) : false);

export const hasTesourariaAccess = (user: TesourariaUser) =>
	hasRole(user, TESOURARIA_ROLE) || hasRole(user, TESOURARIA_ADMIN_ROLE);

export const hasTesourariaAdminAccess = (user: TesourariaUser) => hasRole(user, TESOURARIA_ADMIN_ROLE);

export const getTesourariaAccess = (user: TesourariaUser): TesourariaAccess => {
	if (!user) return 'unauthenticated';

	return hasTesourariaAccess(user) ? 'authorized' : 'unauthorized';
};

export const requireTesourariaAccess = <User extends { roles: string }>(user: User | null | undefined): User => {
	const authenticatedUser = requireAuthenticatedUser(user);
	if (!hasTesourariaAccess(authenticatedUser)) {
		error(403, 'Usuário não possui acesso ao sistema da tesouraria.');
	}

	return authenticatedUser;
};

export const requireTesourariaAdminAccess = <User extends { roles: string }>(user: User | null | undefined): User => {
	const authorizedUser = requireTesourariaAccess(user);
	if (!hasTesourariaAdminAccess(authorizedUser)) {
		error(403, 'Usuário não possui acesso administrativo à tesouraria.');
	}

	return authorizedUser;
};

export const requireTesourariaAdministratorAccess = requireTesourariaAdminAccess;
