import { moduleRoute, staticModuleRoute, type CatalogRoute } from './types';

export const TESOURARIA_ROUTES: readonly CatalogRoute[] = [
	staticModuleRoute('tesouraria-inicio', '/tesouraria'),
	staticModuleRoute('tesouraria-caixa', '/tesouraria/caixa'),
	staticModuleRoute('tesouraria-contribuintes', '/tesouraria/contribuintes'),
	staticModuleRoute('tesouraria-contribuintes-novo', '/tesouraria/contribuintes/novo'),
	moduleRoute(
		'tesouraria-contribuintes-edicao',
		'/tesouraria/contribuintes/[id=integer]',
		({ cadastro }) => `/tesouraria/contribuintes/${cadastro}`,
	),
	staticModuleRoute('tesouraria-estornos', '/tesouraria/estornos'),
	staticModuleRoute('tesouraria-lancamentos', '/tesouraria/lancamentos'),
	moduleRoute(
		'tesouraria-lancamentos-estorno',
		'/tesouraria/lancamentos/[id=integer]/estorno',
		({ lancamento }) => `/tesouraria/lancamentos/${lancamento}/estorno`,
	),
	staticModuleRoute('tesouraria-lancamentos-novo', '/tesouraria/lancamentos/novo'),
];
