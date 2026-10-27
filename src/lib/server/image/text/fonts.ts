import fontkit, { type Font } from '@pdf-lib/fontkit';

import { type FontWeight, readBrandFont } from '#lib/server/brand/fonts.js';

export type { FontWeight };

export type ArtFonts = Record<FontWeight, Font>;

let cachedFonts: Promise<ArtFonts> | undefined;

const readFont = async (weight: FontWeight) => fontkit.create(await readBrandFont(weight));

const readArtFonts = async (): Promise<ArtFonts> => {
	const [regular, medium, bold] = await Promise.all((['regular', 'medium', 'bold'] as const).map(readFont));
	return { regular, medium, bold };
};

const forgetFailedRead = (error: unknown): never => {
	cachedFonts = undefined;
	throw error;
};

export const loadArtFonts = (): Promise<ArtFonts> => {
	cachedFonts ??= readArtFonts().catch(forgetFailedRead);
	return cachedFonts;
};
