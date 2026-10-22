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
	staticModuleRoute('secretaria-frequencia-registro', '/secretaria/frequencia/registro'),
	staticModuleRoute('secretaria-usuarios', '/secretaria/usuarios'),
	staticModuleRoute('secretaria-usuarios-novo', '/secretaria/usuarios/novo'),
	moduleRoute(
		'secretaria-usuarios-edicao',
		'/secretaria/usuarios/[id=alphanumeric]',
		({ usuario }) => `/secretaria/usuarios/${usuario}`,
	),
];
