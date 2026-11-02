import {
	translateBlock,
	type SheetBlock,
	type SheetElement,
	type SheetFrameRole,
	type SheetMeasurers,
	type SheetPageLayout,
} from './elements';
import type { SheetHeading } from './heading';
import { paginateBlocks } from './pagination';
import { buildBlockSeparator, buildSheetFooter, buildSheetHeader } from './sections';
import { BODY_HEIGHT, BODY_TOP } from './typography';

export type SheetFrame = { heading: SheetHeading; generatedOn: string };

type PlacedBlocks<Role extends string> = { top: number; elements: SheetElement<Role>[] };

const placeBlocks = <Role extends string>(blocks: SheetBlock<Role>[]) =>
	blocks.reduce<PlacedBlocks<Role>>(
		({ top, elements }, block, index) => ({
			top: top + block.height,
			elements: [...elements, ...(index > 0 ? [buildBlockSeparator(top)] : []), ...translateBlock(block, top)],
		}),
		{ top: BODY_TOP, elements: [] },
	).elements;

export const frameSheetPages = <Role extends string>(
	frame: SheetFrame,
	bodies: SheetElement<Role>[][],
	measurers: SheetMeasurers,
): SheetPageLayout<Role | SheetFrameRole>[] => {
	const header = buildSheetHeader(frame.heading, measurers);
	return bodies.map((body, index) => ({
		elements: [
			...header,
			...body,
			...buildSheetFooter(
				{ generatedOn: frame.generatedOn, pageNumber: index + 1, pageCount: bodies.length },
				measurers,
			),
		],
	}));
};

export const composeSheetPages = <Role extends string>(
	frame: SheetFrame,
	blocks: SheetBlock<Role>[],
	measurers: SheetMeasurers,
): SheetPageLayout<Role | SheetFrameRole>[] =>
	frameSheetPages(frame, paginateBlocks(blocks, BODY_HEIGHT).map(placeBlocks), measurers);
