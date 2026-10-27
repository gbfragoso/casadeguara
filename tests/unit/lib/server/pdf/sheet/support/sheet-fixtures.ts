import type { SheetBlock, SheetTextStyle } from '#lib/server/pdf/sheet/elements.js';
import { createSheetText } from '#lib/server/pdf/sheet/text.js';
import { TEXT_LEFT, TEXT_WIDTH } from '#lib/server/pdf/sheet/typography.js';
import { testMeasurers } from './measurers';

export const NOVEMBER_2026 = { key: '2026-11', year: 2026, month: 11 };

export const GENERATED_ON = '2026-10-27';

export const SHEET_FRAME = { heading: 'Aniversariantes do mês', month: NOVEMBER_2026, generatedOn: GENERATED_ON };

const BLOCK_STYLE: SheetTextStyle = { size: 10, lineHeight: 12, weight: 'regular', color: 'neutral900' };

export const createTextBlock = (text: string, height: number): SheetBlock<'item'> => ({
	elements: [createSheetText('item', text, BLOCK_STYLE, testMeasurers, { x: TEXT_LEFT, width: TEXT_WIDTH })],
	height,
});
