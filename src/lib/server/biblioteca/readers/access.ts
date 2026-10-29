import { hasBibliotecaAccess } from '#lib/server/authorization/cadastros.js';
import { requireAuthenticatedUser } from '#lib/server/authorization/authenticated-user.js';
import { error } from '@sveltejs/kit';

type ReaderUser = { id: string; roles: string } | null | undefined;

export const requireReaderAccess = (user: ReaderUser) => {
	const authenticatedUser = requireAuthenticatedUser(user);
	if (!hasBibliotecaAccess(authenticatedUser)) {
		error(401, 'Usuário não possui acesso ao sistema da biblioteca.');
	}

	return authenticatedUser;
};
