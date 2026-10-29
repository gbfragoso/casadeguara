import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { redirect } from '@sveltejs/kit';

export const requireAuthenticatedUser = <User>(user: User | null | undefined): User => {
	if (!user) redirect(302, LOGIN_PATH);

	return user;
};
