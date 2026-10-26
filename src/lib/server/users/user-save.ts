import { DuplicateUsernameError } from '#lib/server/models/user-error.js';
import { error } from '@sveltejs/kit';

export const saveUserAccount = async (save: () => Promise<unknown>, successStatus: number, failureMessage: string) => {
	try {
		await save();
		return { status: successStatus };
	} catch (cause) {
		if (cause instanceof DuplicateUsernameError) {
			return { status: 400, field: 'username', message: cause.message };
		}
		console.error(cause);
		error(500, failureMessage);
	}
};
