export type CadastroDashboard = 'biblioteca' | 'secretaria' | 'tesouraria';
export type CadastroAccess = 'authorized' | 'unauthenticated' | 'unauthorized';

type CadastroUser = { roles: string } | null | undefined;

const hasDashboardRole = (roles: string, dashboard: CadastroDashboard) => {
	const acceptedRoles = [dashboard, `${dashboard}:admin`];

	return roles.split(',').some((role) => acceptedRoles.includes(role));
};

export const getCadastroAccess = (user: CadastroUser, dashboard: CadastroDashboard): CadastroAccess => {
	if (!user) return 'unauthenticated';

	return hasDashboardRole(user.roles, dashboard) ? 'authorized' : 'unauthorized';
};

export const hasBibliotecaAccess = (user: CadastroUser) => getCadastroAccess(user, 'biblioteca') === 'authorized';
export const hasSecretariaAccess = (user: CadastroUser) => getCadastroAccess(user, 'secretaria') === 'authorized';
export const hasTesourariaAccess = (user: CadastroUser) => getCadastroAccess(user, 'tesouraria') === 'authorized';
