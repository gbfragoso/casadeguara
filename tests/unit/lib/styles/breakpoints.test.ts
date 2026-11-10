import { describe, expect, it } from 'vitest';

import { DESKTOP_BREAKPOINT } from '#lib/styles/breakpoints.js';
import { readThemeTokens } from './support/theme-tokens';

describe('breakpoints', () => {
	it('matches the desktop breakpoint token of the theme', () => {
		const { light } = readThemeTokens();

		expect(light['--breakpoint-desktop']).toBe(DESKTOP_BREAKPOINT);
	});
});
