import { hasTesourariaAccess } from '#lib/server/authorization/tesouraria.js';
import { requireAuthenticatedUser } from '#lib/server/authorization/authenticated-user.js';
import { error } from '@sveltejs/kit';

type TesourariaUser = { id: string; roles: string } | null | undefined;

export const requireTesourariaAccess = (user: TesourariaUser) => {
	const authenticatedUser = requireAuthenticatedUser(user);
	if (!hasTesourariaAccess(authenticatedUser)) {
		error(401, 'Usuário não possui acesso ao sistema da tesouraria.');
	}

	return authenticatedUser;
};
