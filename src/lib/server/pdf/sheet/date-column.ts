import { stackTexts, type SheetBlock, type SheetMeasurers, type SheetTextElement } from './elements';
import type { TextPlacement } from './text';
import { CONTENT_LEFT, DATE_COLUMN_WIDTH } from './typography';

export const DATE_COLUMN_PLACEMENT: TextPlacement = { x: CONTENT_LEFT, width: DATE_COLUMN_WIDTH, align: 'center' };

const measureWidestLine = (element: SheetTextElement, measurers: SheetMeasurers) =>
	Math.max(...element.lines.map((line) => measurers[element.weight].widthOfTextAtSize(line, element.size)));

export const stackDateColumn = <Role extends string>(
	elements: SheetTextElement<Role>[],
	measurers: SheetMeasurers,
): SheetBlock<Role> => {
	const width = Math.max(0, ...elements.map((element) => measureWidestLine(element, measurers)));
	return stackTexts(elements.map((element) => ({ element: { ...element, width }, gapBefore: 0 })));
};
