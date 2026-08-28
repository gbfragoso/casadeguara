import { describe, expect, it } from 'vitest';

import { PHOTO_FRAME } from '$lib/image/geometry/card';
import { createCropRectangle, type ImageSize } from '$lib/image/crop/rectangle';

const FRAME_ASPECT_RATIO = PHOTO_FRAME.outputWidth / PHOTO_FRAME.outputHeight;
const CENTERED_POSITION = { focalX: 0.5, focalY: 0.5, zoom: 1 };
const SOURCE_CASES: Array<[string, ImageSize]> = [
	['landscape', { width: 600, height: 300 }],
	['portrait', { width: 300, height: 600 }],
	['square', { width: 600, height: 600 }],
];

const expectContainedAndCentered = (source: ImageSize) => {
	const rectangle = createCropRectangle(source, CENTERED_POSITION, FRAME_ASPECT_RATIO);

	expect(rectangle.width / rectangle.height).toBeCloseTo(FRAME_ASPECT_RATIO, 2);
	expect(rectangle.left).toBeGreaterThanOrEqual(0);
	expect(rectangle.top).toBeGreaterThanOrEqual(0);
	expect(rectangle.left + rectangle.width).toBeLessThanOrEqual(source.width);
	expect(rectangle.top + rectangle.height).toBeLessThanOrEqual(source.height);
	expect(Math.abs(rectangle.left + rectangle.width / 2 - source.width / 2)).toBeLessThanOrEqual(0.5);
	expect(Math.abs(rectangle.top + rectangle.height / 2 - source.height / 2)).toBeLessThanOrEqual(0.5);
};

describe('createCropRectangle', () => {
	it.each(SOURCE_CASES)('centers and covers a %s source', (_name, source) => {
		expectContainedAndCentered(source);
	});

	it('limits focal points and zoom without exposing the source edges', () => {
		const source = { width: 1_200, height: 600 };

		const minimum = createCropRectangle(source, { focalX: -1, focalY: -1, zoom: 0 }, FRAME_ASPECT_RATIO);
		const maximum = createCropRectangle(source, { focalX: 2, focalY: 2, zoom: 9 }, FRAME_ASPECT_RATIO);

		expect(minimum).toEqual({ left: 0, top: 0, width: 478, height: 600 });
		expect(maximum).toEqual({ left: 1_041, top: 400, width: 159, height: 200 });
	});

	it('rejects invalid geometry instead of returning an unusable rectangle', () => {
		expect(() => createCropRectangle({ width: 0, height: 300 }, CENTERED_POSITION, FRAME_ASPECT_RATIO)).toThrow(
			'Crop dimensions must be positive.',
		);
		expect(() =>
			createCropRectangle(
				{ width: 300, height: 300 },
				{ ...CENTERED_POSITION, focalX: Number.NaN },
				FRAME_ASPECT_RATIO,
			),
		).toThrow('Crop values must be finite numbers.');
	});
});
