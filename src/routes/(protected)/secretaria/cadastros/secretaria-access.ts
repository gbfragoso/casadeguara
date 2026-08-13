import { hasSecretariaAccess } from '$lib/server/authorization/cadastros';
import { error, redirect } from '@sveltejs/kit';

type SecretariaUser = { id: string; roles: string } | null | undefined;

export const requireSecretariaAccess = (user: SecretariaUser) => {
	if (!user) redirect(302, '/');
	if (!hasSecretariaAccess(user)) {
		error(401, { message: 'Usuário não possui acesso ao sistema da secretaria.' });
	}

	return user;
};
