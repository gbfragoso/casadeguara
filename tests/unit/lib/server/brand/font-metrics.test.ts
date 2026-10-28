import { readFileSync } from 'node:fs';

import fontkit from '@pdf-lib/fontkit';
import { describe, expect, it } from 'vitest';

import { BRAND_FONT_CAP_HEIGHT } from '#lib/server/brand/font-metrics.js';

const FONT_DIRECTORY = 'src/lib/server/brand/fonts';

describe('BRAND_FONT_CAP_HEIGHT', () => {
	it.each(['Regular', 'Medium', 'Bold'])('matches the cap height of Roboto %s', (weight) => {
		const font = fontkit.create(readFileSync(`${FONT_DIRECTORY}/Roboto-${weight}.ttf`));

		const capHeight = font.capHeight / font.unitsPerEm;

		expect(capHeight).toBe(BRAND_FONT_CAP_HEIGHT);
	});
});
