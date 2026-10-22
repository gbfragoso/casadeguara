import type { Page } from '@playwright/test';

import { relativeLuminance } from '../../support/contrast';

export const MINIMUM_PRINT_BACKGROUND_LUMINANCE = 0.5;

const RGB_CHANNELS = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;
const HEX_RADIX = 16;
const HEX_CHANNEL_WIDTH = 2;

type PrintedBackground = { label: string; color: string; image: string };

export const toHexColor = (color: string) => {
	const match = RGB_CHANNELS.exec(color);
	if (!match) throw new Error(`Cor computada sem canais RGB: ${color}`);
	const channels = match
		.slice(1, 4)
		.map((channel) => Number(channel).toString(HEX_RADIX).padStart(HEX_CHANNEL_WIDTH, '0'));
	return `#${channels.join('')}`;
};

export const isTransparent = (color: string) => {
	const alpha = RGB_CHANNELS.exec(color)?.[4];
	return color === 'transparent' || alpha === '0';
};

export const readTokenColor = (page: Page, token: string) =>
	page.evaluate((name) => {
		const probe = document.createElement('span');
		probe.style.color = `var(${name})`;
		document.body.append(probe);
		const color = getComputedStyle(probe).color;
		probe.remove();
		return color;
	}, token);

const collectVisibleBackgrounds = (page: Page): Promise<PrintedBackground[]> =>
	page.evaluate(() =>
		[...document.querySelectorAll('body *')]
			.filter(
				(element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden',
			)
			.map((element) => {
				const style = getComputedStyle(element);
				const label = element.getAttribute('aria-label') ?? element.tagName.toLowerCase();
				return { label, color: style.backgroundColor, image: style.backgroundImage };
			}),
	);

export const findPrintBackgroundViolations = async (page: Page) => {
	const backgrounds = await collectVisibleBackgrounds(page);
	return backgrounds.filter(
		({ color, image }) =>
			image !== 'none' ||
			(!isTransparent(color) && relativeLuminance(toHexColor(color)) < MINIMUM_PRINT_BACKGROUND_LUMINANCE),
	);
};
