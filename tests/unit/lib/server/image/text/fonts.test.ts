import { readFileSync } from 'node:fs';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const read = vi.hoisted(() => vi.fn<(asset: string) => Response>());

vi.mock('$app/server', () => ({ read }));

const readAsset = (asset: string) => new Response(readFileSync(asset.replace(/^\//, '')));

const importFonts = () => import('#lib/server/image/text/fonts.js');

describe('loadArtFonts', () => {
	beforeEach(() => {
		vi.resetModules();
		read.mockImplementation(readAsset);
	});

	afterEach(() => {
		read.mockReset();
	});

	it('loads the Roboto weights once per instance', async () => {
		const { loadArtFonts } = await importFonts();

		const [first, second] = await Promise.all([loadArtFonts(), loadArtFonts()]);

		expect(second).toBe(first);
		expect(Object.values(first).map((font) => font.fullName)).toEqual([
			'Roboto Regular',
			'Roboto Medium',
			'Roboto Bold',
		]);
		expect(read).toHaveBeenCalledTimes(3);
	});

	it('reads the fonts again after a failed read', async () => {
		const { loadArtFonts } = await importFonts();
		read.mockImplementationOnce(() => {
			throw new Error('asset unavailable');
		});
		await expect(loadArtFonts()).rejects.toThrow('asset unavailable');

		const fonts = await loadArtFonts();

		expect(fonts.bold.fullName).toBe('Roboto Bold');
	});
});
