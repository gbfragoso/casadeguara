import { requireAuthenticatedUser } from '#lib/server/authorization/authenticated-user.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	requireAuthenticatedUser(locals.user);
};
