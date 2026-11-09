import { fixedPath, type CatalogRoute } from './types';

const siteRoute = (id: string, route: string, path: string): CatalogRoute => ({
	id,
	route: `/(site)${route}`,
	role: 'public',
	shell: false,
	path: fixedPath(path),
});

export const SITE_ROUTES: readonly CatalogRoute[] = [
	siteRoute('inicio', '', '/'),
	siteRoute('a-instituicao', '/a-instituicao', '/a-instituicao'),
	siteRoute('diretoria', '/diretoria', '/diretoria'),
	siteRoute('palestras', '/palestras', '/palestras'),
	siteRoute('departamento', '/departamentos/[departamento=departamento]', '/departamentos/recanto'),
	siteRoute('material-de-estudo', '/material-de-estudo/[material=material]', '/material-de-estudo/curso-de-passes'),
];
