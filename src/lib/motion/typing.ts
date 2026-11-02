const TYPING_START_MS = 400;
const TYPING_STEP_MS = 45;
const TYPING_MAX_DURATION_MS = 1200;

export type TypedGrapheme = { grapheme: string; position: number; delayMs: number };

const graphemeSegmenter = new Intl.Segmenter('pt-BR', { granularity: 'grapheme' });

const splitGraphemes = (text: string) => Array.from(graphemeSegmenter.segment(text), ({ segment }) => segment);

const readStepMs = (graphemeCount: number) => Math.min(TYPING_STEP_MS, TYPING_MAX_DURATION_MS / graphemeCount);

export const scheduleTyping = (parts: readonly string[]): TypedGrapheme[][] => {
	const graphemesByPart = parts.map(splitGraphemes);
	const stepMs = readStepMs(graphemesByPart.flat().length);
	const offsets = graphemesByPart.map((_, partIndex) => graphemesByPart.slice(0, partIndex).flat().length);

	return graphemesByPart.map((graphemes, partIndex) =>
		graphemes.map((grapheme, index) => {
			const position = offsets[partIndex] + index;
			return { grapheme, position, delayMs: Math.round(TYPING_START_MS + position * stepMs) };
		}),
	);
};
