import type { TextMeasurer } from '#lib/image/text/fit.js';
import type { FontWeight } from '#lib/server/brand/fonts.js';
import type { SheetColor } from './palette';

export type SheetMeasurers = Record<FontWeight, TextMeasurer>;

export type SheetTextStyle = { size: number; lineHeight: number; weight: FontWeight; color: SheetColor };

export type SheetFrameRole = 'instituicao' | 'cabecalho' | 'mes' | 'rodape' | 'geracao';

export type SheetTextElement<Role extends string = string> = SheetTextStyle & {
	kind: 'text';
	role: Role;
	lines: string[];
	x: number;
	top: number;
	width: number;
	align: 'start' | 'center' | 'end';
};

export type SheetRuleElement = {
	kind: 'rule';
	role: 'filete' | 'separador' | 'rodape';
	x: number;
	y: number;
	width: number;
	thickness: number;
	color: SheetColor;
};

export type SheetLogoElement = { kind: 'logo'; x: number; top: number; size: number };

export type SheetElement<Role extends string = string> = SheetTextElement<Role> | SheetRuleElement | SheetLogoElement;

export type SheetPageLayout<Role extends string = string> = { elements: SheetElement<Role>[] };

export type SheetBlock<Role extends string = string> = { elements: SheetTextElement<Role>[]; height: number };

export type StackedText<Role extends string> = { element: SheetTextElement<Role>; gapBefore: number };

export const measureTextHeight = (element: SheetTextElement) => element.lines.length * element.lineHeight;

export const translateBlock = <Role extends string>(
	block: SheetBlock<Role>,
	offset: number,
): SheetTextElement<Role>[] => block.elements.map((element) => ({ ...element, top: element.top + offset }));

export const stackTexts = <Role extends string>(items: StackedText<Role>[]): SheetBlock<Role> =>
	items.reduce<SheetBlock<Role>>(
		(stack, { element, gapBefore }) => {
			const top = stack.elements.length === 0 ? 0 : stack.height + gapBefore;
			return { elements: [...stack.elements, { ...element, top }], height: top + measureTextHeight(element) };
		},
		{ elements: [], height: 0 },
	);
