import { readFileSync } from 'node:fs';

import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';

import { BRAND_FONT_CAP_HEIGHT } from '#lib/server/brand/font-metrics.js';
import type { SheetElement, SheetTextElement } from '#lib/server/pdf/sheet/elements.js';
import { drawSheetPage, type SheetPage } from '#lib/server/pdf/sheet/renderer.js';
import { testMeasurers } from './support/measurers';

const PAGE_HEIGHT = 800;
const LOGO_FILE = 'src/lib/server/brand/casa-de-guara.png';

type DrawnText = { text: string; x: number; y: number };
type DrawnShape = { kind: 'line' | 'image'; x: number; y: number };

const createRecordingPage = () => {
	const texts: DrawnText[] = [];
	const shapes: DrawnShape[] = [];
	const page: SheetPage = {
		getHeight: () => PAGE_HEIGHT,
		drawText: (text, options) => texts.push({ text, x: options?.x ?? 0, y: options?.y ?? 0 }),
		drawLine: ({ start }) => shapes.push({ kind: 'line', ...start }),
		drawImage: (_, options) => shapes.push({ kind: 'image', x: options?.x ?? 0, y: options?.y ?? 0 }),
	};
	return { page, texts, shapes };
};

const loadAssets = async () => {
	const document = await PDFDocument.create();
	return { fonts: testMeasurers, logo: await document.embedPng(readFileSync(LOGO_FILE)) };
};

const createText = (overrides: Partial<SheetTextElement>): SheetTextElement => ({
	kind: 'text',
	role: 'item',
	lines: ['PRIMEIRA', 'SEGUNDA'],
	x: 40,
	top: 100,
	width: 200,
	align: 'start',
	size: 12,
	lineHeight: 20,
	weight: 'bold',
	color: 'neutral900',
	...overrides,
});

const draw = async (elements: SheetElement[]) => {
	const recording = createRecordingPage();
	drawSheetPage(recording.page, { elements }, await loadAssets());
	return recording;
};

describe('drawSheetPage', () => {
	it('draws each line on the baseline that centers its capitals in the line box', async () => {
		const text = createText({});

		const { texts } = await draw([text]);

		const spaces = texts.map(({ y }, index) => {
			const boxTop = PAGE_HEIGHT - text.top - index * text.lineHeight;
			const capTop = y + text.size * BRAND_FONT_CAP_HEIGHT;
			return { above: boxTop - capTop, below: y - (boxTop - text.lineHeight) };
		});
		spaces.forEach(({ above, below }) => expect(above).toBeCloseTo(below));
	});

	it('aligns centered and end lines inside the element width', async () => {
		const elements = [
			createText({ lines: ['08h45'], align: 'center' }),
			createText({ lines: ['86'], align: 'end' }),
		];

		const { texts } = await draw(elements);

		const [centered, ended] = texts.map(({ text, x }, index) => ({
			left: x - elements[index].x,
			right:
				elements[index].x +
				elements[index].width -
				x -
				testMeasurers.bold.widthOfTextAtSize(text, elements[index].size),
		}));
		expect(centered.left).toBeCloseTo(centered.right);
		expect(ended.right).toBeCloseTo(0);
	});

	it('places the rules and the logo from the top of the page', async () => {
		const elements: SheetElement[] = [
			{ kind: 'rule', role: 'separador', x: 40, y: 200, width: 100, thickness: 2, color: 'neutral300' },
			{ kind: 'logo', x: 40, top: 30, size: 30 },
		];

		const { shapes } = await draw(elements);

		expect(shapes).toEqual([
			{ kind: 'line', x: 40, y: PAGE_HEIGHT - 200 - 2 / 2 },
			{ kind: 'image', x: 40, y: PAGE_HEIGHT - 30 - 30 },
		]);
	});
});
