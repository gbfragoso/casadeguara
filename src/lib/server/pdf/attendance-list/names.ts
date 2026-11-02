import type { TextMeasurer } from '#lib/image/text/fit.js';
import { fitSizeToWidth } from '#lib/server/pdf/sheet/text.js';
import { NAME_MAX_SIZE, NAME_MIN_SIZE } from './typography';

export type FittedName = { text: string; size: number };

const NAME_PARTICLES = new Set(['DA', 'DAS', 'DE', 'DI', 'DO', 'DOS', 'DU', 'E']);
const ELLIPSIS = '…';
const WORD_SEPARATOR = /\s+/;

const abbreviate = (word: string) => `${[...word][0]}.`;

const listMiddleNameIndexes = (words: string[]) =>
	words.slice(1, -1).flatMap((word, offset) => (NAME_PARTICLES.has(word) ? [] : [offset + 1]));

const listAbbreviationSteps = (name: string) => {
	const words = name.split(WORD_SEPARATOR);
	return listMiddleNameIndexes(words)
		.reduce<string[][]>(
			(steps, wordIndex) => {
				const previous = steps[steps.length - 1];
				return [...steps, previous.map((word, index) => (index === wordIndex ? abbreviate(word) : word))];
			},
			[words],
		)
		.map((stepWords) => stepWords.join(' '));
};

const truncateWithEllipsis = (text: string, fits: (candidate: string) => boolean) => {
	const characters = [...text];
	const candidates = characters.map((_, index) => {
		const kept = characters.slice(0, characters.length - index - 1).join('');
		return `${kept.trimEnd()}${ELLIPSIS}`;
	});
	return candidates.find(fits) ?? ELLIPSIS;
};

export const fitWorkerName = (name: string, measurer: TextMeasurer, width: number): FittedName => {
	const size = fitSizeToWidth(name, measurer, NAME_MAX_SIZE, width);
	if (size >= NAME_MIN_SIZE) return { text: name, size };

	const fitsAtMinimumSize = (text: string) => measurer.widthOfTextAtSize(text, NAME_MIN_SIZE) <= width;
	const steps = listAbbreviationSteps(name);
	const text = steps.find(fitsAtMinimumSize) ?? truncateWithEllipsis(steps[steps.length - 1], fitsAtMinimumSize);
	return { text, size: NAME_MIN_SIZE };
};
