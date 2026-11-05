import { formatCalendarMonth, type CalendarMonth } from '#lib/utils/calendar-month.js';
import type { SheetFrameRole, SheetMeasurers, SheetTextElement } from './elements';
import { createFrameText, createSheetText, fitSizeToWidth, toUpperCase } from './text';
import { CONTENT_RIGHT, FRAME_STYLES, TEXT_LEFT, TEXT_WIDTH } from './typography';

export type SheetHeading = { kind: 'monthly'; text: string; month: CalendarMonth } | { kind: 'free'; text: string };

type HeadingLine = SheetTextElement<SheetFrameRole>[];

const measureFrameText = (role: SheetFrameRole, text: string, measurers: SheetMeasurers) => {
	const { weight, size } = FRAME_STYLES[role];
	return Math.ceil(measurers[weight].widthOfTextAtSize(text, size));
};

const buildMonthlyLine = (text: string, month: CalendarMonth, measurers: SheetMeasurers, top: number): HeadingLine => {
	const headingText = toUpperCase(text);
	const monthText = `— ${toUpperCase(formatCalendarMonth(month))}`;
	const availableWidth = TEXT_WIDTH - measureFrameText('mes', monthText, measurers);
	const headingWidth = Math.min(measureFrameText('cabecalho', `${headingText} `, measurers), availableWidth);
	const monthLeft = TEXT_LEFT + headingWidth;
	return [
		{ ...createFrameText('cabecalho', headingText, measurers, { x: TEXT_LEFT, width: headingWidth }), top },
		{ ...createFrameText('mes', monthText, measurers, { x: monthLeft, width: CONTENT_RIGHT - monthLeft }), top },
	];
};

const buildFreeLine = (text: string, measurers: SheetMeasurers, top: number): HeadingLine => {
	const style = FRAME_STYLES.cabecalho;
	const headingText = toUpperCase(text);
	const size = fitSizeToWidth(headingText, measurers[style.weight], style.size, TEXT_WIDTH);
	const placement = { x: TEXT_LEFT, width: TEXT_WIDTH };
	return [{ ...createSheetText('cabecalho', headingText, { ...style, size }, measurers, placement), top }];
};

export const buildHeadingLine = (heading: SheetHeading, measurers: SheetMeasurers, top: number): HeadingLine =>
	heading.kind === 'monthly'
		? buildMonthlyLine(heading.text, heading.month, measurers, top)
		: buildFreeLine(heading.text, measurers, top);
