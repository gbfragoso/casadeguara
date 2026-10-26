import type { AreaRoles } from '#lib/server/users/area-roles.js';
import validator from 'validator';

const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 255;

export type UserForm = { username: string; password: string; name: string; roles: string };

export const readUserForm = async (request: Request): Promise<UserForm> => {
	const formData = await request.formData();

	return {
		username: formData.get('username') as string,
		password: formData.get('password') as string,
		name: formData.get('name') as string,
		roles: formData.get('roles') as string,
	};
};

const isAcceptablePassword = (password: string) =>
	typeof password === 'string' && password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH;

export const validateUserForm = (
	{ username, password, roles }: UserForm,
	{ area, requireRoles }: { area: Pick<AreaRoles, 'hasOnly'>; requireRoles: boolean },
) => {
	if (!validator.isEmail(username)) {
		return { status: 400, field: 'username', message: 'E-mail inválido' };
	}
	if (!isAcceptablePassword(password)) {
		return { status: 400, field: 'password', message: 'Senha não atende aos requisitos mínimos de segurança' };
	}
	if ((roles || requireRoles) && !area.hasOnly(roles ?? '')) {
		return { status: 400, field: 'roles', message: 'Setor inválido' };
	}
};
