import { error, redirect } from '@sveltejs/kit';

type LibraryUser = { roles: string } | null | undefined;

export const requireLibraryAccess = (user: LibraryUser) => {
	if (!user) redirect(302, '/');
	if (!user.roles.includes('biblioteca')) {
		error(401, { message: 'Usuário não possui acesso ao sistema da biblioteca' });
	}
};
