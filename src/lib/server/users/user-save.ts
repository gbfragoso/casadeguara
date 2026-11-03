import { DuplicateUsernameError } from '#lib/server/models/user-error.js';
import type { UserAccountFailure, UserAccountValues } from '#lib/server/users/accounts/account-form.js';
import { error, fail } from '@sveltejs/kit';

type UserAccountSave = {
	save: () => Promise<unknown>;
	successStatus: number;
	failureMessage: string;
	values: UserAccountValues;
};

export const saveUserAccount = async ({ save, successStatus, failureMessage, values }: UserAccountSave) => {
	try {
		await save();
		return { status: successStatus };
	} catch (cause) {
		if (cause instanceof DuplicateUsernameError) {
			return fail<UserAccountFailure>(400, { values, errors: { username: [cause.message] } });
		}
		console.error(cause);
		error(500, failureMessage);
	}
};
