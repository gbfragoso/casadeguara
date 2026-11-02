import { describe, expect, it } from 'vitest';

import { scheduleTyping } from '#lib/motion/typing.js';

const readDelays = (parts: readonly string[]) =>
	scheduleTyping(parts)
		.flat()
		.map(({ delayMs }) => delayMs);

describe('scheduleTyping', () => {
	it('types a short title one grapheme every 45 ms after the start delay', () => {
		const delays = readDelays(['Fé']);

		expect(delays).toEqual([400, 445]);
	});

	it('continues the positions of the last word after the lead', () => {
		const [, lastWord] = scheduleTyping(['A ', 'fé']);

		expect(lastWord.map(({ position, delayMs }) => ({ position, delayMs }))).toEqual([
			{ position: 2, delayMs: 490 },
			{ position: 3, delayMs: 535 },
		]);
	});

	it('finishes a long title within 1.2 s after the start delay', () => {
		const delays = readDelays(['A '.repeat(40), 'raciocinada']);

		expect(Math.max(...delays)).toBeLessThanOrEqual(1600);
	});

	it('keeps a combining accent together with its base letter', () => {
		const [graphemes] = scheduleTyping(['fé']);

		expect(graphemes.map(({ grapheme }) => grapheme)).toEqual(['f', 'é']);
	});
});
