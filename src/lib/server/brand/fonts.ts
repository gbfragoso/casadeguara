import { read } from '$app/server';

import boldAsset from './fonts/Roboto-Bold.ttf';
import mediumAsset from './fonts/Roboto-Medium.ttf';
import regularAsset from './fonts/Roboto-Regular.ttf';

export type FontWeight = 'regular' | 'medium' | 'bold';

const FONT_ASSETS: Record<FontWeight, string> = { regular: regularAsset, medium: mediumAsset, bold: boldAsset };

export const readBrandFont = async (weight: FontWeight) =>
	new Uint8Array(await read(FONT_ASSETS[weight]).arrayBuffer());
