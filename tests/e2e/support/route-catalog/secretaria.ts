import { moduleRoute, staticModuleRoute, type CatalogRoute } from './types';

export const SECRETARIA_ROUTES: readonly CatalogRoute[] = [
	staticModuleRoute('secretaria-inicio', '/secretaria'),
	staticModuleRoute('secretaria-amigofraterno', '/secretaria/amigofraterno'),
	staticModuleRoute('secretaria-aniversariantes', '/secretaria/aniversariantes'),
	staticModuleRoute('secretaria-cadastros', '/secretaria/cadastros'),
	staticModuleRoute('secretaria-cadastros-novo', '/secretaria/cadastros/novo'),
	moduleRoute(
		'secretaria-cadastros-edicao',
		'/secretaria/cadastros/[id=integer]',
		({ cadastro }) => `/secretaria/cadastros/${cadastro}`,
	),
	staticModuleRoute('secretaria-frequencia', '/secretaria/frequencia'),
];
