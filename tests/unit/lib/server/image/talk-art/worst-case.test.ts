import { describe, expect, it } from 'vitest';

import { toTalkArtContent, type TalkArtContent } from '#lib/server/image/talk-art/content.js';
import {
	ART_SIZE,
	SAFE_MARGIN,
	type ArtElement,
	type ArtTextBlock,
	type ArtTextRole,
} from '#lib/server/image/talk-art/elements.js';
import { layoutTalkArt } from '#lib/server/image/talk-art/layout.js';
import { ART_PALETTE } from '#lib/server/image/talk-art/palette.js';
import { contrastRatio } from '../../../../../support/contrast';
import { TALLEST_WORST_CASE_TALK, testMeasurers, WIDE_WORST_CASE_TALK } from './support/art-fixtures';
import { boundsOf, intersects, type Box } from './support/bounds';

const MINIMUM_TEXT_CONTRAST = 4.5;
const SAFE_LIMIT = ART_SIZE - SAFE_MARGIN;

const WORST_CASES = [
	{ name: 'wide characters', talk: WIDE_WORST_CASE_TALK },
	{ name: 'tallest wrapping', talk: TALLEST_WORST_CASE_TALK },
];

const listTextBlocks = (elements: ArtElement[]) =>
	elements.filter((element): element is ArtTextBlock => element.kind === 'text');

const listBlocks = (blocks: ArtTextBlock[], role: ArtTextRole) => blocks.filter((block) => block.role === role);

const listLineCounts = (blocks: ArtTextBlock[], role: ArtTextRole) =>
	listBlocks(blocks, role).map((block) => block.lines.length);

const listOverflowingLines = (blocks: ArtTextBlock[]) =>
	blocks.flatMap((block) =>
		block.lines.filter((line) => testMeasurers[block.weight].widthOfTextAtSize(line, block.size) > block.width),
	);

const withoutSpaces = (text: string | null) => (text ?? '').replace(/\s/g, '');

const readRenderedText = (blocks: ArtTextBlock[], role: ArtTextRole) =>
	withoutSpaces(
		listBlocks(blocks, role)
			.flatMap((block) => block.lines)
			.join(''),
	);

const readRenderedTexts = (blocks: ArtTextBlock[]) => ({
	titulo: readRenderedText(blocks, 'titulo'),
	referencia: readRenderedText(blocks, 'referencia'),
	palestrante: readRenderedText(blocks, 'palestrante'),
	atividades: listBlocks(blocks, 'atividade').map((block) => block.lines.join(' ')),
	local: readRenderedText(blocks, 'local'),
});

const readExpectedTexts = (content: TalkArtContent) => ({
	titulo: withoutSpaces(content.titulo),
	referencia: withoutSpaces(content.referencia),
	palestrante: withoutSpaces(content.palestrante),
	atividades: content.atividades,
	local: withoutSpaces(content.local),
});

const isInsideSafeArea = (box: Box) =>
	box.left >= SAFE_MARGIN && box.top >= SAFE_MARGIN && box.right <= SAFE_LIMIT && box.bottom <= SAFE_LIMIT;

const listOutsideSafeArea = (elements: ArtElement[]) =>
	elements.filter(
		(element) => (element.kind === 'text' || element.kind === 'picture') && !isInsideSafeArea(boundsOf(element)),
	);

const isObstacleFor = (text: ArtTextBlock, element: ArtElement) => {
	if (element.kind === 'picture' || element.kind === 'text') return element !== text;
	return text.background === 'fundo' && element.fill === 'forma';
};

const findCollisions = (elements: ArtElement[]) =>
	listTextBlocks(elements).flatMap((text) =>
		elements
			.filter((other) => isObstacleFor(text, other) && intersects(boundsOf(text), boundsOf(other)))
			.map((other) => `${text.role} × ${other.kind === 'text' ? other.role : other.kind}`),
	);

describe('talk art worst cases', () => {
	it.each(WORST_CASES)('fits the CA-10 worst case without clipping or overlap: $name', ({ talk }) => {
		const content = toTalkArtContent(talk);

		const { elements } = layoutTalkArt(content, testMeasurers);

		const blocks = listTextBlocks(elements);
		expect(listOverflowingLines(blocks)).toEqual([]);
		expect(listLineCounts(blocks, 'titulo')[0]).toBeLessThanOrEqual(3);
		expect(listLineCounts(blocks, 'palestrante')[0]).toBeLessThanOrEqual(2);
		expect(listLineCounts(blocks, 'atividade')).toEqual([1, 1, 1, 1, 1]);
		expect(readRenderedTexts(blocks)).toEqual(readExpectedTexts(content));
		expect(findCollisions(elements)).toEqual([]);
		expect(listOutsideSafeArea(elements)).toEqual([]);
	});

	it.each(WORST_CASES)('keeps every text above 4.5:1 contrast against its background: $name', ({ talk }) => {
		const { elements } = layoutTalkArt(toTalkArtContent(talk), testMeasurers);

		const ratios = listTextBlocks(elements).map((block) =>
			contrastRatio(ART_PALETTE[block.color], ART_PALETTE[block.background]),
		);

		expect(Math.min(...ratios)).toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST);
	});
});
