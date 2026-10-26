import { fitText, type TextMeasurer } from '#lib/image/text/fit.js';
import type { FontWeight } from '#lib/server/image/text/fonts.js';
import type { ArtTextBlock, ArtTextRole, StackItem } from './elements';
import type { ArtColor } from './palette';

export type ArtMeasurers = Record<FontWeight, TextMeasurer>;

export type TextPlacement = {
	x: number;
	width: number;
	background: ArtColor;
	anchor?: ArtTextBlock['anchor'];
	maxSize?: number;
};

type BlockStyle = {
	weight: FontWeight;
	maxSize: number;
	minSize: number;
	maxLines: number;
	lineHeightRatio: number;
	color: ArtColor;
};

const SIZE_STEP = 2;

const BLOCK_STYLES: Record<ArtTextRole, BlockStyle> = {
	instituicao: { weight: 'medium', maxSize: 30, minSize: 30, maxLines: 1, lineHeightRatio: 1.2, color: 'texto' },
	dia: { weight: 'bold', maxSize: 88, minSize: 88, maxLines: 1, lineHeightRatio: 1.05, color: 'textoClaro' },
	mes: { weight: 'bold', maxSize: 28, minSize: 28, maxLines: 1, lineHeightRatio: 1.2, color: 'destaqueClaro' },
	destaque: { weight: 'bold', maxSize: 40, minSize: 40, maxLines: 1, lineHeightRatio: 1.2, color: 'rotulo' },
	titulo: { weight: 'bold', maxSize: 64, minSize: 36, maxLines: 3, lineHeightRatio: 1.1, color: 'textoForte' },
	referencia: {
		weight: 'regular',
		maxSize: 32,
		minSize: 24,
		maxLines: 2,
		lineHeightRatio: 1.25,
		color: 'textoSuave',
	},
	rotuloPalestrante: { weight: 'bold', maxSize: 28, minSize: 28, maxLines: 1, lineHeightRatio: 1.2, color: 'rotulo' },
	palestrante: { weight: 'bold', maxSize: 36, minSize: 24, maxLines: 2, lineHeightRatio: 1.15, color: 'textoForte' },
	rotuloReuniao: { weight: 'bold', maxSize: 28, minSize: 28, maxLines: 1, lineHeightRatio: 1.2, color: 'rotulo' },
	atividade: { weight: 'regular', maxSize: 26, minSize: 20, maxLines: 1, lineHeightRatio: 1.25, color: 'texto' },
	local: { weight: 'medium', maxSize: 26, minSize: 20, maxLines: 2, lineHeightRatio: 1.25, color: 'textoClaro' },
};

export class TalkArtOverflowError extends Error {
	constructor(readonly block: ArtTextRole | 'secoes') {
		super(`O bloco ${block} não cabe na arte.`);
		this.name = 'TalkArtOverflowError';
	}
}

export const measureTextHeight = (block: ArtTextBlock) => block.lines.length * block.lineHeight;

const fitBlockText = (role: ArtTextRole, text: string, measurers: ArtMeasurers, placement: TextPlacement) => {
	const style = BLOCK_STYLES[role];
	const maxSize = placement.maxSize ?? style.maxSize;
	const fitted = fitText(text, measurers[style.weight], {
		width: placement.width,
		maxLines: style.maxLines,
		maxSize,
		minSize: Math.min(style.minSize, maxSize),
		step: SIZE_STEP,
		breakWords: true,
	});
	if (!fitted.fits) throw new TalkArtOverflowError(role);
	return fitted;
};

export const createTextBlock = (
	role: ArtTextRole,
	text: string,
	measurers: ArtMeasurers,
	placement: TextPlacement,
): ArtTextBlock => {
	const { weight, color, lineHeightRatio } = BLOCK_STYLES[role];
	const { lines, size } = fitBlockText(role, text, measurers, placement);
	return {
		kind: 'text',
		role,
		lines,
		x: placement.x,
		top: 0,
		size,
		lineHeight: Math.round(size * lineHeightRatio),
		weight,
		color,
		background: placement.background,
		anchor: placement.anchor ?? 'start',
		width: placement.width,
	};
};

export const createUniformBlocks = (
	role: ArtTextRole,
	texts: string[],
	measurers: ArtMeasurers,
	placement: TextPlacement,
): ArtTextBlock[] => {
	const sizes = texts.map((text) => fitBlockText(role, text, measurers, placement).size);
	const maxSize = Math.min(...sizes);
	return texts.map((text) => createTextBlock(role, text, measurers, { ...placement, maxSize }));
};

export const toTextItem = (block: ArtTextBlock, gapBefore = 0): StackItem => ({
	elements: [block],
	height: measureTextHeight(block),
	gapBefore,
});
