import { loadBrandLogo } from '#lib/server/brand/logo.js';
import { rasterizeSvg } from '#lib/server/image/rasterizer.js';
import { loadArtFonts } from '#lib/server/image/text/fonts.js';
import { createArtMeasurers } from '#lib/server/image/text/shaper.js';
import type { ReadyTalk } from '#lib/talks/art/readiness.js';
import { toTalkArtContent, type TalkArtSource } from './content';
import { layoutTalkArt } from './layout';
import { renderTalkArtSvg } from './svg';

export const generateTalkArt = async (talk: ReadyTalk<TalkArtSource>): Promise<Uint8Array> => {
	const content = toTalkArtContent(talk);
	const [fonts, logo] = await Promise.all([loadArtFonts(), loadBrandLogo()]);
	const layout = layoutTalkArt(content, createArtMeasurers(fonts));
	return rasterizeSvg(renderTalkArtSvg(layout, fonts, { logo, photo: content.foto }));
};
