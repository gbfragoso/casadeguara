import { error, redirect } from '@sveltejs/kit';

export const requireLibraryAccess = <User extends { roles: string }>(user: User | null | undefined): User => {
	if (!user) redirect(302, '/');
	if (!user.roles.includes('biblioteca')) {
		error(401, { message: 'Usuário não possui acesso ao sistema da biblioteca' });
	}

	return user;
};
