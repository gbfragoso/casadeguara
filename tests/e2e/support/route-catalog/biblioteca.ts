import type { RouteEntities } from '../route-entities';
import { moduleRoute, staticModuleRoute, type CatalogRoute } from './types';

const registryRoutes = (segment: string, entity: (entities: RouteEntities) => number | string) => [
	staticModuleRoute(`biblioteca-${segment}`, `/biblioteca/${segment}`),
	staticModuleRoute(`biblioteca-${segment}-novo`, `/biblioteca/${segment}/novo`),
	moduleRoute(
		`biblioteca-${segment}-edicao`,
		`/biblioteca/${segment}/[id=${segment === 'usuarios' ? 'alphanumeric' : 'integer'}]`,
		(entities) => `/biblioteca/${segment}/${entity(entities)}`,
	),
];

const bookAssociationRoutes = ['autores', 'exemplares', 'keywords'].map((segment) =>
	moduleRoute(
		`biblioteca-livros-${segment}`,
		`/biblioteca/livros/[id=integer]/${segment}`,
		({ livro }) => `/biblioteca/livros/${livro}/${segment}`,
	),
);

export const BIBLIOTECA_ROUTES: readonly CatalogRoute[] = [
	staticModuleRoute('biblioteca-inicio', '/biblioteca'),
	...registryRoutes('autores', ({ autor }) => autor),
	staticModuleRoute('biblioteca-avisos', '/biblioteca/avisos'),
	moduleRoute(
		'biblioteca-avisos-edicao',
		'/biblioteca/avisos/[id=integer]',
		({ aviso }) => `/biblioteca/avisos/${aviso}`,
	),
	staticModuleRoute('biblioteca-cobrancas', '/biblioteca/cobrancas'),
	...registryRoutes('colecoes', ({ colecao }) => colecao),
	...registryRoutes('editoras', ({ editora }) => editora),
	...registryRoutes('emprestimos', ({ emprestimo }) => emprestimo),
	moduleRoute(
		'biblioteca-emprestimos-recibo',
		'/biblioteca/emprestimos/[id=integer]/recibo',
		({ emprestimo }) => `/biblioteca/emprestimos/${emprestimo}/recibo`,
	),
	...registryRoutes('keywords', ({ keyword }) => keyword),
	...registryRoutes('leitores', ({ cadastro }) => cadastro),
	...registryRoutes('livros', ({ livro }) => livro),
	...bookAssociationRoutes,
	...registryRoutes('usuarios', ({ usuario }) => usuario),
];
