import { describe, expect, it } from 'vitest';

import { groupImageVariants, readResponsiveImage } from '#lib/image/responsive/variants.js';

describe('groupImageVariants', () => {
	it('offers every width of an image and serves the largest by default', () => {
		const urlsByPath = {
			'../images/sede-1280.webp': '/assets/sede-1280.webp',
			'../images/sede-640.webp': '/assets/sede-640.webp',
		};

		const image = readResponsiveImage(groupImageVariants(urlsByPath), 'sede');

		expect(image).toEqual({
			src: '/assets/sede-1280.webp',
			srcset: '/assets/sede-640.webp 640w, /assets/sede-1280.webp 1280w',
		});
	});

	it('keeps images with different names apart', () => {
		const urlsByPath = { '../a/capa-640.webp': '/capa.webp', '../a/sede-01-640.webp': '/sede.webp' };

		const names = [...groupImageVariants(urlsByPath).keys()];

		expect(names).toEqual(['capa', 'sede-01']);
	});

	it('rejects a file without a width suffix', () => {
		const urlsByPath = { '../images/capa.webp': '/capa.webp' };

		expect(() => groupImageVariants(urlsByPath)).toThrow('../images/capa.webp');
	});
});

describe('readResponsiveImage', () => {
	it('rejects an image that was not copied', () => {
		const images = groupImageVariants({ '../images/capa-640.webp': '/capa.webp' });

		expect(() => readResponsiveImage(images, 'sede')).toThrow('sede');
	});
});
