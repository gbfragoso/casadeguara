export type TextMeasurer = { widthOfTextAtSize(text: string, size: number): number };

export type FitOptions = {
	width: number;
	maxLines: number;
	maxSize: number;
	minSize: number;
	step: number;
	breakWords: boolean;
};

export type FittedText = { lines: string[]; size: number; fits: boolean };

type LineFit = (text: string) => boolean;

const splitWords = (text: string) => text.trim().split(/\s+/);

const breakWord = (word: string, fitsLine: LineFit) =>
	[...word].reduce<string[]>((parts, character) => {
		const previous = parts.at(-1);
		const candidate = `${previous ?? ''}${character}`;
		if (previous !== undefined && fitsLine(candidate)) return [...parts.slice(0, -1), candidate];
		return [...parts, character];
	}, []);

const wrapWords = (words: string[], fitsLine: LineFit) =>
	words.reduce<string[]>((lines, word) => {
		const previous = lines.at(-1) ?? '';
		const candidate = previous ? `${previous} ${word}` : word;
		if (fitsLine(candidate)) return [...lines.slice(0, -1), candidate];
		return [...lines, word];
	}, []);

const wrapAtSize = (words: string[], measure: TextMeasurer, size: number, options: FitOptions) => {
	const fitsLine = (text: string) => measure.widthOfTextAtSize(text, size) <= options.width;
	const tokens = options.breakWords
		? words.flatMap((word) => (fitsLine(word) ? [word] : breakWord(word, fitsLine)))
		: words;
	return wrapWords(tokens, fitsLine);
};

const listSizes = ({ maxSize, minSize, step }: FitOptions) =>
	Array.from({ length: Math.ceil((maxSize - minSize) / step) + 1 }, (_, index) =>
		Math.max(maxSize - index * step, minSize),
	);

export const fitText = (text: string, measure: TextMeasurer, options: FitOptions): FittedText => {
	const words = splitWords(text);
	for (const size of listSizes(options)) {
		const lines = wrapAtSize(words, measure, size, options);
		if (lines.length <= options.maxLines) return { lines, size, fits: true };
	}

	return { lines: wrapAtSize(words, measure, options.minSize, options), size: options.minSize, fits: false };
};
