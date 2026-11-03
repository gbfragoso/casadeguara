import {
	ACCESS_LEVEL_VALUES,
	accessFieldName,
	mapSystemModules,
	type AccessLevel,
	type UserAccess,
} from '#lib/users/access.js';
import { createUserAccountSchema, editUserAccountSchema } from '#lib/validation/user-account.js';
import { flattenError, type output } from 'zod';

const NO_ACCESS: AccessLevel = 'none';
const SUPERUSER_FIELD = 'superuser';
const CHECKED_VALUE = 'on';

export type AccountFormMode = 'create' | 'edit';
export type CreateAccountInput = output<typeof createUserAccountSchema>;
export type EditAccountInput = output<typeof editUserAccountSchema>;
export type UserAccountField = 'username' | 'name' | 'password' | 'access' | 'superuser';
export type UserAccountValues = { username: string; name: string; access: UserAccess };
export type UserAccountFailure = {
	values: UserAccountValues;
	errors: Partial<Record<UserAccountField, string[]>>;
};

const isAccessLevel = (value: unknown): value is AccessLevel => ACCESS_LEVEL_VALUES.some((level) => level === value);

const readText = (formData: FormData, field: string) => {
	const value = formData.get(field);

	return typeof value === 'string' ? value : '';
};

const isSuperuserChecked = (formData: FormData) => formData.get(SUPERUSER_FIELD) === CHECKED_VALUE;

const readRawInput = (formData: FormData) => ({
	username: formData.get('username'),
	name: formData.get('name'),
	password: formData.get('password'),
	access: {
		modules: mapSystemModules((module) => formData.get(accessFieldName(module)) ?? NO_ACCESS),
		superuser: isSuperuserChecked(formData),
	},
});

export const readUserAccountValues = (formData: FormData): UserAccountValues => ({
	username: readText(formData, 'username'),
	name: readText(formData, 'name'),
	access: {
		modules: mapSystemModules((module) => {
			const level = formData.get(accessFieldName(module));

			return isAccessLevel(level) ? level : NO_ACCESS;
		}),
		superuser: isSuperuserChecked(formData),
	},
});

type AccountFormResult<Input> = { success: true; data: Input } | { success: false; failure: UserAccountFailure };

const validate = (formData: FormData, mode: AccountFormMode) => {
	const rawInput = readRawInput(formData);

	return mode === 'create' ? createUserAccountSchema.safeParse(rawInput) : editUserAccountSchema.safeParse(rawInput);
};

export function parseUserAccountForm(formData: FormData, mode: 'create'): AccountFormResult<CreateAccountInput>;
export function parseUserAccountForm(formData: FormData, mode: 'edit'): AccountFormResult<EditAccountInput>;
export function parseUserAccountForm(
	formData: FormData,
	mode: AccountFormMode,
): AccountFormResult<CreateAccountInput | EditAccountInput> {
	const result = validate(formData, mode);
	if (result.success) return { success: true, data: result.data };

	return {
		success: false,
		failure: { values: readUserAccountValues(formData), errors: flattenError(result.error).fieldErrors },
	};
}
