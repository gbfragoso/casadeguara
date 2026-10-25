import { moduleRoute, staticModuleRoute, type CatalogRoute } from './types';

export const COMUNICACAO_ROUTES: readonly CatalogRoute[] = [
	staticModuleRoute('comunicacao-palestras', '/comunicacao/palestras'),
	staticModuleRoute('comunicacao-palestrantes', '/comunicacao/palestrantes'),
	staticModuleRoute('comunicacao-usuarios', '/comunicacao/usuarios'),
	staticModuleRoute('comunicacao-usuarios-novo', '/comunicacao/usuarios/novo'),
	moduleRoute(
		'comunicacao-usuarios-edicao',
		'/comunicacao/usuarios/[id=alphanumeric]',
		({ contaPropria }) => `/comunicacao/usuarios/${contaPropria}`,
	),
];
