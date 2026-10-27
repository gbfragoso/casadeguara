import { readFileSync } from 'node:fs';

import fontkit from '@pdf-lib/fontkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readBrandFont } from '#lib/server/brand/fonts.js';

const read = vi.hoisted(() => vi.fn<(asset: string) => Response>());

vi.mock('$app/server', () => ({ read }));

const readAsset = (asset: string) => new Response(readFileSync(asset.replace(/^\//, '')));

describe('TU-30 readBrandFont', () => {
	beforeEach(() => {
		read.mockImplementation(readAsset);
	});

	afterEach(() => {
		read.mockReset();
	});

	it.each([
		['regular', 'Roboto Regular'],
		['medium', 'Roboto Medium'],
		['bold', 'Roboto Bold'],
	] as const)('reads the %s Roboto weight from the brand fonts', async (weight, fullName) => {
		const bytes = await readBrandFont(weight);

		expect(read).toHaveBeenCalledWith(expect.stringContaining('/src/lib/server/brand/fonts/'));
		expect(fontkit.create(bytes).fullName).toBe(fullName);
	});
});
