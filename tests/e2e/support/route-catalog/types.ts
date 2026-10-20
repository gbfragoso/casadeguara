import type { RouteEntities } from '../route-entities';

export type RouteRole = 'public' | 'admin';

export type CatalogRoute = {
	id: string;
	route: string;
	role: RouteRole;
	shell: boolean;
	path: (entities: RouteEntities) => string;
};

export const fixedPath = (path: string) => () => path;

export const moduleRoute = (id: string, route: string, path: CatalogRoute['path']): CatalogRoute => ({
	id,
	route: `/(protected)${route}`,
	role: 'admin',
	shell: true,
	path,
});

export const staticModuleRoute = (id: string, route: string) => moduleRoute(id, route, fixedPath(route));
