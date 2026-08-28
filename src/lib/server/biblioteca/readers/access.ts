import { hasBibliotecaAccess } from '$lib/server/authorization/cadastros';
import { error, redirect } from '@sveltejs/kit';

type ReaderUser = { id: string; roles: string } | null | undefined;

export const requireReaderAccess = (user: ReaderUser) => {
	if (!user) redirect(302, '/');
	if (!hasBibliotecaAccess(user)) {
		error(401, { message: 'Usuário não possui acesso ao sistema da biblioteca.' });
	}

	return user;
};
