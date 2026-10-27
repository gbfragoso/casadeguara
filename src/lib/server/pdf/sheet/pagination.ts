type PageFill<Block> = { pages: Block[][]; usedHeight: number };

export const paginateBlocks = <Block extends { height: number }>(blocks: Block[], bodyHeight: number): Block[][] =>
	blocks.reduce<PageFill<Block>>(
		({ pages, usedHeight }, block) => {
			const currentPage = pages.at(-1);
			if (currentPage && usedHeight + block.height <= bodyHeight) {
				return {
					pages: [...pages.slice(0, -1), [...currentPage, block]],
					usedHeight: usedHeight + block.height,
				};
			}
			return { pages: [...pages, [block]], usedHeight: block.height };
		},
		{ pages: [], usedHeight: 0 },
	).pages;
