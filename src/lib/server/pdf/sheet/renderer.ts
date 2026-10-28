import { rgb, type PDFFont, type PDFPage } from 'pdf-lib';

import type { SheetAssets } from './assets';
import type { SheetElement, SheetLogoElement, SheetPageLayout, SheetRuleElement, SheetTextElement } from './elements';
import { measureBaselineOffset } from './line-box';
import { SHEET_PALETTE, type SheetColor } from './palette';

export type SheetPage = Pick<PDFPage, 'getHeight' | 'drawText' | 'drawLine' | 'drawImage'>;

const HEX_CHANNEL_OFFSETS = [1, 3, 5] as const;
const HEX_CHANNEL_LENGTH = 2;
const CHANNEL_MAXIMUM = 255;

const toPdfColor = (color: SheetColor) => {
	const hex = SHEET_PALETTE[color];
	const [red, green, blue] = HEX_CHANNEL_OFFSETS.map(
		(offset) => Number.parseInt(hex.slice(offset, offset + HEX_CHANNEL_LENGTH), 16) / CHANNEL_MAXIMUM,
	);
	return rgb(red, green, blue);
};

const alignLine = (element: SheetTextElement, lineWidth: number) => {
	if (element.align === 'center') return element.x + (element.width - lineWidth) / 2;
	if (element.align === 'end') return element.x + element.width - lineWidth;
	return element.x;
};

const drawText = (page: SheetPage, element: SheetTextElement, font: PDFFont) => {
	const firstBaseline = page.getHeight() - element.top - measureBaselineOffset(element);
	const color = toPdfColor(element.color);
	element.lines.forEach((line, index) =>
		page.drawText(line, {
			x: alignLine(element, font.widthOfTextAtSize(line, element.size)),
			y: firstBaseline - index * element.lineHeight,
			size: element.size,
			font,
			color,
		}),
	);
};

const drawRule = (page: SheetPage, element: SheetRuleElement) => {
	const y = page.getHeight() - element.y - element.thickness / 2;
	page.drawLine({
		start: { x: element.x, y },
		end: { x: element.x + element.width, y },
		thickness: element.thickness,
		color: toPdfColor(element.color),
	});
};

const drawLogo = (page: SheetPage, element: SheetLogoElement, assets: SheetAssets) =>
	page.drawImage(assets.logo, {
		x: element.x,
		y: page.getHeight() - element.top - element.size,
		width: element.size,
		height: element.size,
	});

const drawElement = (page: SheetPage, element: SheetElement, assets: SheetAssets) => {
	if (element.kind === 'text') return drawText(page, element, assets.fonts[element.weight]);
	if (element.kind === 'rule') return drawRule(page, element);
	drawLogo(page, element, assets);
};

export const drawSheetPage = (page: SheetPage, layout: SheetPageLayout, assets: SheetAssets) =>
	layout.elements.forEach((element) => drawElement(page, element, assets));
