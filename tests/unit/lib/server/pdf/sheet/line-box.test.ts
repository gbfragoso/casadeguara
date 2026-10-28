import { describe, expect, it } from 'vitest';

import { BRAND_FONT_CAP_HEIGHT } from '#lib/server/brand/font-metrics.js';
import { computeLineHeight, measureBaselineOffset } from '#lib/server/pdf/sheet/line-box.js';

const capHeightOf = (size: number) => size * BRAND_FONT_CAP_HEIGHT;

describe('measureBaselineOffset', () => {
	it('centers the capitals in the line box', () => {
		const line = { size: 12, lineHeight: 20 };

		const baseline = measureBaselineOffset(line);

		const spaceAbove = baseline - capHeightOf(line.size);
		const spaceBelow = line.lineHeight - baseline;
		expect(spaceAbove).toBeCloseTo(spaceBelow);
	});
});

describe('computeLineHeight', () => {
	it.each([
		{ first: 12, second: 12 },
		{ first: 12, second: 10 },
	])('leaves the line gap from a $first pt baseline to the capitals of a $second pt line', ({ first, second }) => {
		const lineGap = 5;
		const firstLine = { size: first, lineHeight: computeLineHeight(first, lineGap) };
		const secondLine = { size: second, lineHeight: computeLineHeight(second, lineGap) };

		const firstBaseline = measureBaselineOffset(firstLine);
		const secondCapTop = firstLine.lineHeight + measureBaselineOffset(secondLine) - capHeightOf(second);

		expect(secondCapTop - firstBaseline).toBeCloseTo(lineGap);
	});
});
