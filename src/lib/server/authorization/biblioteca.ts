import { error, redirect } from '@sveltejs/kit';
import { hasBibliotecaAccess } from './cadastros';

export const requireLibraryAccess = <User extends { roles: string }>(user: User | null | undefined): User => {
	if (!user) redirect(302, '/');
	if (!hasBibliotecaAccess(user)) {
		error(401, { message: 'Usuário não possui acesso ao sistema da biblioteca' });
	}

	return user;
};

export const requireLibraryAdminAccess = <User extends { roles: string }>(user: User | null | undefined): User => {
	const authorizedUser = requireLibraryAccess(user);
	const isAdministrator = authorizedUser.roles.split(',').some((role) => role === 'biblioteca:admin');

	if (!isAdministrator) {
		error(401, { message: 'Usuário não possui acesso administrativo à biblioteca' });
	}

	return authorizedUser;
};
