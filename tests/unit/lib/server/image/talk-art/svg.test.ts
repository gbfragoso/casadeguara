import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { toTalkArtContent } from '#lib/server/image/talk-art/content.js';
import { layoutTalkArt } from '#lib/server/image/talk-art/layout.js';
import { renderTalkArtSvg } from '#lib/server/image/talk-art/svg.js';
import { CA04_TALK, loadTestFonts, testMeasurers } from './support/art-fixtures';

const LOGO = new Uint8Array(readFileSync('src/lib/server/brand/casa-de-guara.png'));
const PHOTO = new Uint8Array(readFileSync('tests/fixtures/amigo-fraterno-photo.jpeg'));
const EMBEDDED_IMAGE = /<image href="data:image\/(?:png|jpeg);base64,([^"]+)"[^>]*clip-path="url\(#([\w-]+)\)"/g;
const fonts = loadTestFonts();

const renderCa04 = (foto: Uint8Array | null) => {
	const talk = { ...CA04_TALK, palestrante: { ...CA04_TALK.palestrante, foto } };
	const layout = layoutTalkArt(toTalkArtContent(talk), testMeasurers);
	return renderTalkArtSvg(layout, fonts, { logo: LOGO, photo: foto });
};

const readEmbeddedImages = (svg: string) =>
	[...svg.matchAll(EMBEDDED_IMAGE)].map(([, base64, clipId]) => ({
		bytes: new Uint8Array(Buffer.from(base64, 'base64')),
		clip: new RegExp(`<clipPath id="${clipId}"><circle [^>]+/></clipPath>`).test(svg),
	}));

describe('renderTalkArtSvg', () => {
	it('embeds only the logo and the square speaker photo clipped in a circle', () => {
		const svg = renderCa04(PHOTO);

		const images = readEmbeddedImages(svg);

		expect(svg.match(/<image /g)).toHaveLength(2);
		expect(images).toEqual([
			{ bytes: LOGO, clip: true },
			{ bytes: PHOTO, clip: true },
		]);
	});

	it('shows the logo in the speaker circle when there is no photo', () => {
		const svg = renderCa04(null);

		const images = readEmbeddedImages(svg);

		expect(images.map(({ bytes }) => bytes)).toEqual([LOGO, LOGO]);
	});

	it('draws every text as outlines without user text in the markup', () => {
		const svg = renderCa04(null);

		const markupTexts = ['NINGUÉM', 'Ninguém', 'Cap. IV', 'ALCIONE', 'Estudo do Evangelho', 'MAJOR', 'Palestrante'];

		expect(svg).not.toMatch(/<text|<tspan|font-family/);
		expect(markupTexts.filter((text) => svg.includes(text))).toEqual([]);
	});
});
