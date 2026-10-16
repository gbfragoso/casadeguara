import { error, redirect } from '@sveltejs/kit';
import { hasBibliotecaAccess } from './cadastros';

const LIBRARY_ADMIN_ROLE = 'biblioteca:admin';

export const hasLibraryAdminAccess = (user: { roles: string }) =>
	user.roles.split(',').some((role) => role === LIBRARY_ADMIN_ROLE);

export const requireLibraryAccess = <User extends { roles: string }>(user: User | null | undefined): User => {
	if (!user) redirect(302, '/');
	if (!hasBibliotecaAccess(user)) {
		error(401, 'Usuário não possui acesso ao sistema da biblioteca');
	}

	return user;
};

export const requireLibraryAdminAccess = <User extends { roles: string }>(user: User | null | undefined): User => {
	const authorizedUser = requireLibraryAccess(user);

	if (!hasLibraryAdminAccess(authorizedUser)) {
		error(401, 'Usuário não possui acesso administrativo à biblioteca');
	}

	return authorizedUser;
};
