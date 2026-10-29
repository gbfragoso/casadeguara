import { describe, expect, it } from 'vitest';

import {
	INSTITUTION_COORDINATES,
	INSTITUTION_DIRECTIONS_URL,
	INSTITUTION_MAP_EMBED_URL,
	INSTITUTION_MAP_URL,
} from '#lib/brand/institution.js';
import { DEPARTMENTS } from '#lib/site/departments.js';

describe('public site content', () => {
	it('points the library to the public catalogue', () => {
		const library = DEPARTMENTS.find(({ slug }) => slug === 'biblioteca');

		expect(library?.link?.href).toBe('/acervo');
	});

	it('routes to the full address with the postal code', () => {
		const destination = new URL(INSTITUTION_DIRECTIONS_URL).searchParams.get('destination');

		expect(destination).toBe('Rua Major Dórea, 86, Castália, Itabuna-BA, 45603-184');
	});

	it('pins the embedded map on the Casa coordinates', () => {
		const marker = new URL(INSTITUTION_MAP_EMBED_URL).searchParams.get('marker');

		expect(marker).toBe('-14.7818467,-39.2738578');
	});

	it('frames the embedded map around the Casa', () => {
		const { latitude, longitude } = INSTITUTION_COORDINATES;

		const [west, south, east, north] = (new URL(INSTITUTION_MAP_EMBED_URL).searchParams.get('bbox') ?? '')
			.split(',')
			.map(Number);

		expect([west < longitude, longitude < east, south < latitude, latitude < north]).toEqual([
			true,
			true,
			true,
			true,
		]);
	});

	it('opens the full map centred on the Casa', () => {
		const url = new URL(INSTITUTION_MAP_URL);

		expect(url.searchParams.get('mlat')).toBe('-14.7818467');
		expect(url.searchParams.get('mlon')).toBe('-39.2738578');
	});
});
