import { describe, expect, it } from 'vitest';

import { BOARD_COORDINATIONS } from '#lib/site/board.js';
import { DEPARTMENT_PAGE_SLUGS, findDepartmentPage } from '#lib/site/department-pages/index.js';

const PAGES = DEPARTMENT_PAGE_SLUGS.map((slug) => findDepartmentPage(slug));

describe('department pages', () => {
	it('serves every photo from the app with a description', () => {
		const photos = PAGES.flatMap((page) => [page.capa, ...page.galerias.flatMap((gallery) => gallery.fotos)]);

		const unresolved = photos.filter(
			(photo) => !photo.src.endsWith('.webp') || !photo.srcset.includes('w') || photo.alt.trim() === '',
		);

		expect(photos).toHaveLength(58);
		expect(unresolved).toEqual([]);
	});

	it('names the coordination of every department from the board', () => {
		const coordinations = PAGES.flatMap((page) => page.coordenacao);

		const missing = coordinations.filter((key) => !(key in BOARD_COORDINATIONS));

		expect(coordinations.length).toBeGreaterThanOrEqual(PAGES.length);
		expect(missing).toEqual([]);
	});

	it('shows the Recanto de Potira in three galleries', () => {
		const galleries = findDepartmentPage('recanto').galerias.map(({ titulo, fotos }) => [titulo, fotos.length]);

		expect(galleries).toEqual([
			['Sede', 8],
			['Entregas', 19],
			['Oficinas para gestantes, mamães e crianças', 13],
		]);
	});
});
