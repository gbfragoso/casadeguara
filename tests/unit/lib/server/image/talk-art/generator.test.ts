import { readFile } from 'node:fs/promises';

import sharp from 'sharp';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/server', async () => {
	const { readFileSync } = await import('node:fs');
	return { read: (asset: string) => new Response(readFileSync(asset.replace(/^\//, ''))) };
});

import { generateTalkArt } from '#lib/server/image/talk-art/generator.js';
import { CA04_TALK } from './support/art-fixtures';

describe('generateTalkArt', () => {
	it('renders a 1080 square sRGB PNG', async () => {
		const foto = new Uint8Array(await readFile('tests/fixtures/amigo-fraterno-photo.jpeg'));
		const talk = { ...CA04_TALK, palestrante: { ...CA04_TALK.palestrante, foto } };

		const png = await generateTalkArt(talk);

		const metadata = await sharp(png).metadata();
		expect(metadata).toMatchObject({ format: 'png', width: 1080, height: 1080, space: 'srgb' });
		expect(metadata.icc).toBeInstanceOf(Buffer);
	});
});
