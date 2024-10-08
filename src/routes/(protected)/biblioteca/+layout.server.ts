import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user?.roles.includes('biblioteca')) {
		error(401, {
			message: 'Usuário não possui acesso ao sistema da biblioteca',
		});
	}
	const name = {
		name: locals.user.name,
		isAdmin: locals.user.roles.includes(':admin'),
	};
	return name;
};
