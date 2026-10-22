import { ACCESS_ROUTES } from './route-catalog/acesso';
import { BIBLIOTECA_ROUTES } from './route-catalog/biblioteca';
import { SECRETARIA_ROUTES } from './route-catalog/secretaria';
import { TESOURARIA_ROUTES } from './route-catalog/tesouraria';
import type { CatalogRoute } from './route-catalog/types';

export type { CatalogRoute, RouteRole } from './route-catalog/types';

export const NOT_FOUND_PATH = '/rota-inexistente';

export const ROUTE_CATALOG: readonly CatalogRoute[] = [
	...ACCESS_ROUTES,
	...BIBLIOTECA_ROUTES,
	...SECRETARIA_ROUTES,
	...TESOURARIA_ROUTES,
];

export const selectRoutes = (ids: readonly string[]) =>
	ids.map((id) => {
		const route = ROUTE_CATALOG.find((entry) => entry.id === id);
		if (!route) throw new Error(`Rota ausente do catálogo: ${id}`);
		return route;
	});
