import { fitText, type TextMeasurer } from '#lib/image/text/fit.js';

const MINIMUM_NAME_SIZE = 4;
const MAXIMUM_NAME_LINES = 2;
const NAME_SIZE_STEP = 1;

export const fitName = (name: string, measure: TextMeasurer, width: number, initialSize = 12) => {
	const { lines, size } = fitText(name, measure, {
		width,
		maxLines: MAXIMUM_NAME_LINES,
		maxSize: initialSize,
		minSize: MINIMUM_NAME_SIZE,
		step: NAME_SIZE_STEP,
		breakWords: false,
	});
	return { lines, size };
};
