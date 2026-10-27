import type { EntryLayout } from './entries';

type PageFill = { pages: EntryLayout[][]; usedHeight: number };

export const paginateEntries = (entries: EntryLayout[], bodyHeight: number): EntryLayout[][] =>
	entries.reduce<PageFill>(
		({ pages, usedHeight }, entry) => {
			const currentPage = pages.at(-1);
			if (currentPage && usedHeight + entry.height <= bodyHeight) {
				return {
					pages: [...pages.slice(0, -1), [...currentPage, entry]],
					usedHeight: usedHeight + entry.height,
				};
			}
			return { pages: [...pages, [entry]], usedHeight: entry.height };
		},
		{ pages: [], usedHeight: 0 },
	).pages;
