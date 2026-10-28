import { BRAND_FONT_CAP_HEIGHT } from '#lib/server/brand/font-metrics.js';
import type {
	SheetElement,
	SheetPageLayout,
	SheetRuleElement,
	SheetTextElement,
} from '#lib/server/pdf/sheet/elements.js';
import { measureBaselineOffset } from '#lib/server/pdf/sheet/line-box.js';
import { testMeasurers } from './measurers';

export type Box = { left: number; top: number; right: number; bottom: number };

export const listTexts = <Role extends string>({ elements }: SheetPageLayout<Role>) =>
	elements.filter((element): element is SheetTextElement<Role> => element.kind === 'text');

export const readTexts = <Role extends string>(page: SheetPageLayout<Role>, role: Role) =>
	listTexts(page)
		.filter((element) => element.role === role)
		.map((element) => element.lines.join(' '));

export const boundsOf = (element: SheetElement): Box => {
	switch (element.kind) {
		case 'text':
			return {
				left: element.x,
				top: element.top,
				right: element.x + element.width,
				bottom: element.top + element.lines.length * element.lineHeight,
			};
		case 'rule':
			return {
				left: element.x,
				top: element.y,
				right: element.x + element.width,
				bottom: element.y + element.thickness,
			};
		default:
			return {
				left: element.x,
				top: element.top,
				right: element.x + element.size,
				bottom: element.top + element.size,
			};
	}
};

export const intersects = (first: Box, second: Box) =>
	first.left < second.right && second.left < first.right && first.top < second.bottom && second.top < first.bottom;

export const baselineOf = (element: SheetTextElement, lineIndex: number) =>
	element.top + lineIndex * element.lineHeight + measureBaselineOffset(element);

export const capTopOf = (element: SheetTextElement, lineIndex = 0) =>
	baselineOf(element, lineIndex) - element.size * BRAND_FONT_CAP_HEIGHT;

export const lastBaselineOf = (element: SheetTextElement) => baselineOf(element, element.lines.length - 1);

export const drawnLeftOf = (element: SheetTextElement, lineIndex = 0) => {
	const lineWidth = testMeasurers[element.weight].widthOfTextAtSize(element.lines[lineIndex], element.size);
	if (element.align === 'center') return element.x + (element.width - lineWidth) / 2;
	if (element.align === 'end') return element.x + element.width - lineWidth;
	return element.x;
};

export const listRules = ({ elements }: SheetPageLayout, role: SheetRuleElement['role']) =>
	elements.filter((element): element is SheetRuleElement => element.kind === 'rule' && element.role === role);
