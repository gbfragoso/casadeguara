import type { CalendarMonth } from '#lib/utils/calendar-month.js';
import {
	translateBlock,
	type SheetBlock,
	type SheetElement,
	type SheetFrameRole,
	type SheetMeasurers,
	type SheetPageLayout,
} from './elements';
import { paginateBlocks } from './pagination';
import { buildBlockSeparator, buildSheetFooter, buildSheetHeader } from './sections';
import { BODY_HEIGHT, BODY_TOP } from './typography';

export type SheetFrame = { heading: string; month: CalendarMonth; generatedOn: string };

type PlacedBlocks<Role extends string> = { top: number; elements: SheetElement<Role>[] };

const placeBlocks = <Role extends string>(blocks: SheetBlock<Role>[]) =>
	blocks.reduce<PlacedBlocks<Role>>(
		({ top, elements }, block, index) => ({
			top: top + block.height,
			elements: [...elements, ...(index > 0 ? [buildBlockSeparator(top)] : []), ...translateBlock(block, top)],
		}),
		{ top: BODY_TOP, elements: [] },
	).elements;

export const composeSheetPages = <Role extends string>(
	frame: SheetFrame,
	blocks: SheetBlock<Role>[],
	measurers: SheetMeasurers,
): SheetPageLayout<Role | SheetFrameRole>[] => {
	const header = buildSheetHeader(frame.heading, frame.month, measurers);
	const pages = paginateBlocks(blocks, BODY_HEIGHT);
	return pages.map((blocksOfPage, index) => ({
		elements: [
			...header,
			...placeBlocks(blocksOfPage),
			...buildSheetFooter(
				{ generatedOn: frame.generatedOn, pageNumber: index + 1, pageCount: pages.length },
				measurers,
			),
		],
	}));
};
