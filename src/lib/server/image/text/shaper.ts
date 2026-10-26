import type { Font, GlyphRun } from '@pdf-lib/fontkit';

import type { TextMeasurer } from '#lib/image/text/fit.js';
import type { ArtFonts, FontWeight } from './fonts';

export type TextOrigin = { x: number; baseline: number };

type GlyphPlacement = { x: number; y: number; scale: number };

const PATH_SEGMENT = /([MLQCZ])([^MLQCZ]*)/g;
const COORDINATE_PRECISION = 100;

const sumAdvances = (run: GlyphRun) => run.positions.reduce((total, position) => total + position.xAdvance, 0);

export const createTextMeasurer = (font: Font): TextMeasurer => ({
	widthOfTextAtSize: (text, size) => (sumAdvances(font.layout(text)) * size) / font.unitsPerEm,
});

export const createArtMeasurers = (fonts: ArtFonts): Record<FontWeight, TextMeasurer> => ({
	regular: createTextMeasurer(fonts.regular),
	medium: createTextMeasurer(fonts.medium),
	bold: createTextMeasurer(fonts.bold),
});

const roundCoordinate = (value: number) => Math.round(value * COORDINATE_PRECISION) / COORDINATE_PRECISION;

const placeCoordinates = (args: string, placement: GlyphPlacement) =>
	args
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map(Number)
		.map((value, index) =>
			index % 2 === 0
				? roundCoordinate(placement.x + value * placement.scale)
				: roundCoordinate(placement.y - value * placement.scale),
		)
		.join(' ');

const placeGlyphPath = (svgPath: string, placement: GlyphPlacement) =>
	[...svgPath.matchAll(PATH_SEGMENT)]
		.map(([, command, args]) => `${command}${placeCoordinates(args, placement)}`)
		.join('');

export const toTextPath = (font: Font, text: string, size: number, origin: TextOrigin): string => {
	const scale = size / font.unitsPerEm;
	const run = font.layout(text);
	return run.glyphs.reduce(
		({ path, penX }, glyph, index) => {
			const { xAdvance, xOffset, yOffset } = run.positions[index];
			const placement = { x: penX + xOffset * scale, y: origin.baseline - yOffset * scale, scale };
			return { path: path + placeGlyphPath(glyph.path.toSVG(), placement), penX: penX + xAdvance * scale };
		},
		{ path: '', penX: origin.x },
	).path;
};
