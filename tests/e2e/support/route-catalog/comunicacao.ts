import { moduleRoute, staticModuleRoute, type CatalogRoute } from './types';

export const COMUNICACAO_ROUTES: readonly CatalogRoute[] = [
	staticModuleRoute('comunicacao-palestras', '/comunicacao/palestras'),
	staticModuleRoute('comunicacao-palestrantes', '/comunicacao/palestrantes'),
	staticModuleRoute('comunicacao-palestrantes-novo', '/comunicacao/palestrantes/novo'),
	staticModuleRoute('comunicacao-palestrantes-importar', '/comunicacao/palestrantes/importar'),
	moduleRoute(
		'comunicacao-palestrantes-edicao',
		'/comunicacao/palestrantes/[id=integer]',
		({ palestrante }) => `/comunicacao/palestrantes/${palestrante}`,
	),
];
