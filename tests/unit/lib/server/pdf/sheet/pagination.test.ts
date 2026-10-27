import { describe, expect, it } from 'vitest';

import { paginateBlocks } from '#lib/server/pdf/sheet/pagination.js';

const BODY_HEIGHT = 100;

const readIds = (pages: { id: string }[][]) => pages.map((page) => page.map(({ id }) => id));

describe('TU-01 paginateBlocks', () => {
	it('fills a page with the blocks that fit in order', () => {
		const blocks = [
			{ id: 'a', height: 40 },
			{ id: 'b', height: 60 },
			{ id: 'c', height: 30 },
		];

		const pages = paginateBlocks(blocks, BODY_HEIGHT);

		expect(readIds(pages)).toEqual([['a', 'b'], ['c']]);
	});

	it('moves a block taller than the rest of the page whole to the next page', () => {
		const blocks = [
			{ id: 'a', height: 70 },
			{ id: 'b', height: 50 },
			{ id: 'c', height: 20 },
		];

		const pages = paginateBlocks(blocks, BODY_HEIGHT);

		expect(readIds(pages)).toEqual([['a'], ['b', 'c']]);
	});

	it('gives a block taller than the page body a page of its own', () => {
		const blocks = [
			{ id: 'a', height: 10 },
			{ id: 'b', height: 150 },
			{ id: 'c', height: 10 },
		];

		const pages = paginateBlocks(blocks, BODY_HEIGHT);

		expect(readIds(pages)).toEqual([['a'], ['b'], ['c']]);
	});
});
