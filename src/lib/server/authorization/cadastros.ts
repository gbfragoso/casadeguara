export type CadastroDashboard = 'biblioteca' | 'secretaria' | 'tesouraria';
export type CadastroAccess = 'authorized' | 'unauthenticated' | 'unauthorized';

export type CadastroUser = { roles: string } | null | undefined;

export const parseRoles = (roles: string) =>
	roles
		.split(',')
		.map((role) => role.trim())
		.filter(Boolean);

const hasDashboardRole = (roles: string, dashboard: CadastroDashboard) => {
	const acceptedRoles = [dashboard, `${dashboard}:admin`];

	return parseRoles(roles).some((role) => acceptedRoles.includes(role));
};

export const getCadastroAccess = (user: CadastroUser, dashboard: CadastroDashboard): CadastroAccess => {
	if (!user) return 'unauthenticated';

	return hasDashboardRole(user.roles, dashboard) ? 'authorized' : 'unauthorized';
};

export const hasBibliotecaAccess = (user: CadastroUser) => getCadastroAccess(user, 'biblioteca') === 'authorized';
export const hasSecretariaAccess = (user: CadastroUser) => getCadastroAccess(user, 'secretaria') === 'authorized';
export const hasTesourariaAccess = (user: CadastroUser) => getCadastroAccess(user, 'tesouraria') === 'authorized';
