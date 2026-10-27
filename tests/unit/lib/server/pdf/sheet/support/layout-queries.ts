import type { SheetElement, SheetPageLayout, SheetTextElement } from '#lib/server/pdf/sheet/elements.js';

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
