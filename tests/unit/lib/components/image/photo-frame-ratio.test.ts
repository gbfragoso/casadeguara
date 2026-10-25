// @vitest-environment happy-dom
import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PhotoCropper from '#lib/components/image/PhotoCropper.svelte';
import PhotoSection from '#lib/components/image/PhotoSection.svelte';
import { PHOTO_FRAME } from '#lib/image/geometry/card.js';

vi.mock('$app/forms', () => ({ enhance: () => undefined }));

const CARD_ASPECT_RATIO = PHOTO_FRAME.outputWidth / PHOTO_FRAME.outputHeight;
const SPEAKER_INSTRUCTIONS =
	'Use as setas do teclado ou arraste a imagem para escolher a área que aparecerá na foto do palestrante.';

const readAspectRatio = (element: Element | null) =>
	Number(/aspect-ratio:\s*([\d.]+)/.exec(element?.getAttribute('style') ?? '')?.[1]);

const getFrame = (target: HTMLElement) => {
	const frame = target.querySelector('[role="button"][aria-label="Área de enquadramento da foto"]');
	if (!(frame instanceof HTMLElement)) throw new Error('Cropper frame was not rendered.');
	return frame;
};

const loadImage = (target: HTMLElement, width: number, height: number) => {
	const image = target.querySelector('[data-testid="photo-cropper"] img');
	if (!(image instanceof HTMLImageElement)) throw new Error('Cropper image was not rendered.');
	Object.defineProperty(image, 'naturalWidth', { value: width });
	Object.defineProperty(image, 'naturalHeight', { value: height });
	image.dispatchEvent(new Event('load'));
	flushSync();
	return image;
};

describe('photo frame ratio', () => {
	let target: HTMLDivElement;
	let component: ReturnType<typeof mount> | undefined;

	beforeEach(() => {
		target = document.createElement('div');
		document.body.append(target);
	});

	afterEach(() => {
		if (component) unmount(component);
		component = undefined;
		target.remove();
	});

	it('uses a square frame and a square preview crop when the aspect ratio is 1', () => {
		component = mount(PhotoCropper, { target, props: { src: 'blob:photo', aspectRatio: 1 } });
		flushSync();

		const image = loadImage(target, 900, 500);

		expect(readAspectRatio(getFrame(target))).toBe(1);
		expect(image.style.width).toBe('180%');
		expect(image.style.height).toBe('100%');
		expect(image.style.left).toBe('-40%');
	});

	it('keeps the card frame and instructions by default', () => {
		component = mount(PhotoCropper, { target, props: { src: 'blob:photo' } });
		flushSync();

		expect(readAspectRatio(getFrame(target))).toBeCloseTo(CARD_ASPECT_RATIO);
		expect(target.querySelector('#photo-cropper-instructions')?.textContent).toBe(
			'Use as setas do teclado ou arraste a imagem para escolher a área que aparecerá no cartão.',
		);
	});

	it('applies the section ratio and instructions to the photo and the reframe editor', () => {
		component = mount(PhotoSection, {
			target,
			props: { hasPhoto: true, alt: 'Foto de Carmélia', aspectRatio: 1, instructions: SPEAKER_INSTRUCTIONS },
		});
		flushSync();

		target.querySelector<HTMLButtonElement>('#reenquadrar-foto')?.click();
		flushSync();

		expect(readAspectRatio(target.querySelector('img[alt="Foto de Carmélia"]'))).toBe(1);
		expect(readAspectRatio(getFrame(target))).toBe(1);
		expect(target.querySelector('#photo-cropper-instructions')?.textContent).toBe(SPEAKER_INSTRUCTIONS);
	});
});
