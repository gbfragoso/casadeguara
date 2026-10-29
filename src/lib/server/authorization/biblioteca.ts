import { requireAuthenticatedUser } from './authenticated-user';
import { error } from '@sveltejs/kit';
import { hasBibliotecaAccess } from './cadastros';

const LIBRARY_ADMIN_ROLE = 'biblioteca:admin';

export const hasLibraryAdminAccess = (user: { roles: string }) =>
	user.roles.split(',').some((role) => role === LIBRARY_ADMIN_ROLE);

export const requireLibraryAccess = <User extends { roles: string }>(user: User | null | undefined): User => {
	const authenticatedUser = requireAuthenticatedUser(user);
	if (!hasBibliotecaAccess(authenticatedUser)) {
		error(401, 'Usuário não possui acesso ao sistema da biblioteca');
	}

	return authenticatedUser;
};

export const requireLibraryAdminAccess = <User extends { roles: string }>(user: User | null | undefined): User => {
	const authorizedUser = requireLibraryAccess(user);

	if (!hasLibraryAdminAccess(authorizedUser)) {
		error(401, 'Usuário não possui acesso administrativo à biblioteca');
	}

	return authorizedUser;
};
