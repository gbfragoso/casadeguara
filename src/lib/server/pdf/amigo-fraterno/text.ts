type TextMeasurer = { widthOfTextAtSize(text: string, size: number): number };

const MINIMUM_NAME_SIZE = 4;

const splitWords = (text: string) => text.trim().split(/\s+/);

const createLines = (words: string[], measure: TextMeasurer, size: number, width: number) =>
	words.reduce<string[]>((lines, word) => {
		const previous = lines.at(-1) ?? '';
		const candidate = previous ? `${previous} ${word}` : word;
		if (measure.widthOfTextAtSize(candidate, size) <= width) return [...lines.slice(0, -1), candidate];
		return [...lines, word];
	}, []);

export const fitName = (name: string, measure: TextMeasurer, width: number, initialSize = 12) => {
	for (let size = initialSize; size >= MINIMUM_NAME_SIZE; size -= 1) {
		const lines = createLines(splitWords(name), measure, size, width);
		if (lines.length <= 2) return { lines, size };
	}

	return { lines: createLines(splitWords(name), measure, MINIMUM_NAME_SIZE, width), size: MINIMUM_NAME_SIZE };
};
