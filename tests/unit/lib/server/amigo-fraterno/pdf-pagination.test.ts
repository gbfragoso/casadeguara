import { describe, expect, it } from 'vitest';

import { CARDS_PER_PAGE } from '$lib/server/amigo-fraterno/pdf-layout';
import { numberParticipants, paginateCards } from '$lib/server/amigo-fraterno/pdf-pagination';

describe('PDF card pagination', () => {
	it.each([0, 1, 6, 7, 12, 13])('creates the required number of pages for %i cards', (count) => {
		const numbered = numberParticipants(Array.from({ length: count }, (_, id) => ({ id })));

		const pages = paginateCards(numbered);

		expect(pages).toHaveLength(Math.ceil(count / CARDS_PER_PAGE));
		expect(pages.flat().map(({ participant }) => participant.id)).toEqual(
			Array.from({ length: count }, (_, id) => id),
		);
	});

	it('numbers cards sequentially with at least two digits', () => {
		const numbered = numberParticipants(Array.from({ length: 100 }, (_, id) => ({ id })));

		expect(numbered.map(({ number }) => number)).toEqual(expect.arrayContaining(['01', '02', '100']));
	});
});
