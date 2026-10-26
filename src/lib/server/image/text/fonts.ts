import { read } from '$app/server';
import fontkit, { type Font } from '@pdf-lib/fontkit';

import boldAsset from './fonts/Roboto-Bold.ttf';
import mediumAsset from './fonts/Roboto-Medium.ttf';
import regularAsset from './fonts/Roboto-Regular.ttf';

export type FontWeight = 'regular' | 'medium' | 'bold';

export type ArtFonts = Record<FontWeight, Font>;

let cachedFonts: Promise<ArtFonts> | undefined;

const readFont = async (asset: string) => fontkit.create(new Uint8Array(await read(asset).arrayBuffer()));

const readArtFonts = async (): Promise<ArtFonts> => {
	const [regular, medium, bold] = await Promise.all([regularAsset, mediumAsset, boldAsset].map(readFont));
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
