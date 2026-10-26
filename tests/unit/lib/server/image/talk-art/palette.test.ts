import { describe, expect, it } from 'vitest';

import { ART_PALETTE } from '#lib/server/image/talk-art/palette.js';
import { readThemeTokens, resolveToken } from '../../../styles/support/theme-tokens';

const INSTITUTIONAL_RAMP = /^--color-(primary|accent)(-\d+)?$/;
const WHITE = '#ffffff';

const listInstitutionalColors = () => {
	const { light } = readThemeTokens();
	const ramp = Object.keys(light)
		.filter((name) => INSTITUTIONAL_RAMP.test(name))
		.map((name) => resolveToken(light, name).toLowerCase());
	return new Set([...ramp, WHITE]);
};

describe('talk art palette', () => {
	it('uses only institutional palette colors', () => {
		const institutionalColors = listInstitutionalColors();

		const foreignColors = Object.values(ART_PALETTE).filter((color) => !institutionalColors.has(color));

		expect(foreignColors).toEqual([]);
	});
});
