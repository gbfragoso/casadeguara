import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.user?.roles.includes('financeiro')) error(401, {
        message: 'Usuário não possui acesso ao sistema da tesouraria',
    });
};
