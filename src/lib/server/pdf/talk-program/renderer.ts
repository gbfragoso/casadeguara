import { rgb, type PDFFont, type PDFPage } from 'pdf-lib';

import type { ProgramAssets } from './assets';
import type {
	ProgramElement,
	ProgramLogoElement,
	ProgramPageLayout,
	ProgramRuleElement,
	ProgramTextElement,
} from './elements';
import { PROGRAM_PALETTE, type ProgramColor } from './palette';

const HEX_CHANNEL_OFFSETS = [1, 3, 5] as const;
const HEX_CHANNEL_LENGTH = 2;
const CHANNEL_MAXIMUM = 255;

const toPdfColor = (color: ProgramColor) => {
	const hex = PROGRAM_PALETTE[color];
	const [red, green, blue] = HEX_CHANNEL_OFFSETS.map(
		(offset) => Number.parseInt(hex.slice(offset, offset + HEX_CHANNEL_LENGTH), 16) / CHANNEL_MAXIMUM,
	);
	return rgb(red, green, blue);
};

const alignLine = (element: ProgramTextElement, lineWidth: number) => {
	if (element.align === 'center') return element.x + (element.width - lineWidth) / 2;
	if (element.align === 'end') return element.x + element.width - lineWidth;
	return element.x;
};

const drawText = (page: PDFPage, element: ProgramTextElement, font: PDFFont) => {
	const firstBaseline = page.getHeight() - element.top - font.heightAtSize(element.size, { descender: false });
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

const drawRule = (page: PDFPage, element: ProgramRuleElement) => {
	const y = page.getHeight() - element.y - element.thickness / 2;
	page.drawLine({
		start: { x: element.x, y },
		end: { x: element.x + element.width, y },
		thickness: element.thickness,
		color: toPdfColor(element.color),
	});
};

const drawLogo = (page: PDFPage, element: ProgramLogoElement, assets: ProgramAssets) =>
	page.drawImage(assets.logo, {
		x: element.x,
		y: page.getHeight() - element.top - element.size,
		width: element.size,
		height: element.size,
	});

const drawElement = (page: PDFPage, element: ProgramElement, assets: ProgramAssets) => {
	if (element.kind === 'text') return drawText(page, element, assets.fonts[element.weight]);
	if (element.kind === 'rule') return drawRule(page, element);
	drawLogo(page, element, assets);
};

export const drawProgramPage = (page: PDFPage, layout: ProgramPageLayout, assets: ProgramAssets) =>
	layout.elements.forEach((element) => drawElement(page, element, assets));
