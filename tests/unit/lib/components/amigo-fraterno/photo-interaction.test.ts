// @vitest-environment happy-dom
import { mount, tick, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PhotoCropper from '$lib/components/amigo-fraterno/PhotoCropper.svelte';
import PhotoSection from '$lib/components/amigo-fraterno/PhotoSection.svelte';

vi.mock('$app/forms', () => ({
	enhance: () => () => undefined,
}));

const createFileList = (file: File) => Object.defineProperty({}, '0', { value: file, enumerable: true });

const createPointerEvent = (type: string, init: Record<string, number | string>) => {
	const event = new Event(type, { bubbles: true });
	for (const [key, value] of Object.entries(init)) Object.defineProperty(event, key, { value, configurable: true });
	return event;
};

describe('PhotoCropper interactions', () => {
	let target: HTMLDivElement;

	beforeEach(() => {
		target = document.createElement('div');
		document.body.append(target);
	});

	afterEach(() => {
		target.remove();
	});

	it('updates position with keyboard, zoom, pointer drag, reset, and image dimensions', async () => {
		const component = mount(PhotoCropper, {
			target,
			props: { src: 'blob:photo', initialPosition: { focalX: 0.6, focalY: 0.4, zoom: 1.2 } },
		});
		await tick();
		const frame = target.querySelector('[role="button"]');
		const image = target.querySelector('img');
		const zoom = target.querySelector('input[type="range"]');
		if (
			!(frame instanceof HTMLDivElement) ||
			!(image instanceof HTMLImageElement) ||
			!(zoom instanceof HTMLInputElement)
		)
			throw new Error('Cropper controls were not rendered.');
		vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 300));
		frame.setPointerCapture = () => {
			throw new DOMException('No active pointer', 'NotFoundError');
		};
		frame.releasePointerCapture = () => {
			throw new DOMException('No active pointer', 'NotFoundError');
		};

		frame.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		zoom.value = '2';
		zoom.dispatchEvent(new Event('input', { bubbles: true }));
		frame.dispatchEvent(
			createPointerEvent('pointerdown', {
				pointerId: 1,
				pointerType: 'touch',
				clientX: 100,
				clientY: 100,
			}),
		);
		frame.dispatchEvent(createPointerEvent('pointermove', { pointerId: 1, clientX: 120, clientY: 130 }));
		frame.dispatchEvent(createPointerEvent('pointerup', { pointerId: 1 }));
		Object.defineProperty(image, 'naturalWidth', { value: 900 });
		Object.defineProperty(image, 'naturalHeight', { value: 500 });
		image.dispatchEvent(new Event('load', { bubbles: true }));
		await tick();

		expect(target.querySelector('input[name="focalX"]')?.getAttribute('value')).not.toBe('0.6');
		expect(target.querySelector('input[name="zoom"]')?.getAttribute('value')).toBe('2');
		target.querySelector('button')?.click();
		await tick();
		expect(target.querySelector('input[name="focalX"]')?.getAttribute('value')).toBe('0.5');
		expect(target.querySelector('input[name="zoom"]')?.getAttribute('value')).toBe('1');
		unmount(component);
	});

	it('ignores unsupported pointer and keyboard interactions when disabled', async () => {
		const onPositionChange = vi.fn();
		const component = mount(PhotoCropper, {
			target,
			props: { src: 'blob:photo', onPositionChange },
		});
		await tick();
		const frame = target.querySelector('[role="button"]');
		if (!(frame instanceof HTMLDivElement)) throw new Error('Cropper frame was not rendered.');
		frame.setPointerCapture = () => undefined;
		frame.releasePointerCapture = () => undefined;

		frame.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		frame.dispatchEvent(createPointerEvent('pointerdown', { pointerId: 2, pointerType: 'mouse', button: 2 }));
		frame.dispatchEvent(createPointerEvent('pointermove', { pointerId: 2 }));
		frame.dispatchEvent(createPointerEvent('pointerup', { pointerId: 2 }));
		frame.dispatchEvent(createPointerEvent('pointerdown', { pointerId: 4, pointerType: 'touch' }));
		frame.dispatchEvent(createPointerEvent('pointerup', { pointerId: 4 }));

		const disabled = mount(PhotoCropper, { target, props: { src: 'blob:photo', disabled: true } });
		await tick();
		const disabledFrame = target.querySelectorAll('[role="button"]')[1];
		disabledFrame.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
		disabledFrame.dispatchEvent(createPointerEvent('pointerdown', { pointerId: 3, pointerType: 'touch' }));
		expect(onPositionChange).not.toHaveBeenCalled();
		unmount(disabled);
		unmount(component);
	});
});

describe('PhotoSection interactions', () => {
	let target: HTMLDivElement;
	let createObjectUrl: ReturnType<typeof vi.fn>;
	let revokeObjectUrl: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		target = document.createElement('div');
		document.body.append(target);
		createObjectUrl = vi.fn(() => 'blob:photo');
		revokeObjectUrl = vi.fn();
		Object.defineProperty(URL, 'createObjectURL', { value: createObjectUrl, configurable: true });
		Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectUrl, configurable: true });
	});

	afterEach(() => {
		target.remove();
	});

	it('opens a local preview, cancels it, and revokes the object URL', async () => {
		const component = mount(PhotoSection, { target, props: { hasPhoto: false, alt: 'Foto de Maria' } });
		const input = target.querySelector('#foto');
		if (!(input instanceof HTMLInputElement)) throw new Error('Photo input was not rendered.');
		const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
		Object.defineProperty(input, 'files', { value: createFileList(file), configurable: true });
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await tick();

		expect(createObjectUrl).toHaveBeenCalledWith(file);
		expect(target.querySelector('[data-testid="photo-cropper"]')).not.toBeNull();
		const cancelButton = [...target.querySelectorAll('button')].find((button) =>
			button.textContent?.includes('Cancelar'),
		);
		cancelButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await tick();
		expect(revokeObjectUrl).toHaveBeenCalledWith('blob:photo');
		expect(target.querySelector('[data-testid="photo-cropper"]')).toBeNull();
		unmount(component);
	});

	it('revokes the previous preview when selecting another file and on destroy', async () => {
		const component = mount(PhotoSection, { target, props: { hasPhoto: false, alt: 'Foto de Maria' } });
		const input = target.querySelector('#foto');
		if (!(input instanceof HTMLInputElement)) throw new Error('Photo input was not rendered.');
		const firstFile = new File(['first'], 'first.jpg', { type: 'image/jpeg' });
		const secondFile = new File(['second'], 'second.jpg', { type: 'image/jpeg' });
		Object.defineProperty(input, 'files', { value: createFileList(firstFile), configurable: true });
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await tick();
		Object.defineProperty(input, 'files', { value: createFileList(secondFile), configurable: true });
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await tick();

		expect(revokeObjectUrl).toHaveBeenCalledWith('blob:photo');
		unmount(component);
		expect(revokeObjectUrl).toHaveBeenCalledTimes(2);
	});

	it('rejects an unsupported file and preserves an existing photo', async () => {
		const component = mount(PhotoSection, { target, props: { hasPhoto: true, alt: 'Foto de Maria' } });
		const input = target.querySelector('#foto');
		if (!(input instanceof HTMLInputElement)) throw new Error('Photo input was not rendered.');
		const file = new File(['not an image'], 'photo.txt', { type: 'text/plain' });
		Object.defineProperty(input, 'files', { value: createFileList(file), configurable: true });
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await tick();

		expect(target.querySelector('[role="alert"]')?.textContent).toContain('A foto deve ser JPEG ou PNG');
		expect(target.querySelector('img[alt="Foto de Maria"]')).not.toBeNull();
		unmount(component);
	});

	it('returns focus to the reframing trigger after canceling', async () => {
		const component = mount(PhotoSection, {
			target,
			props: {
				hasPhoto: true,
				alt: 'Foto de Maria',
				photoUrl: '/secretaria/cadastros/4/foto',
				originalPhotoUrl: '/secretaria/cadastros/4/foto/original',
			},
		});
		const trigger = target.querySelector('#reenquadrar-foto');
		if (!(trigger instanceof HTMLButtonElement)) throw new Error('Reframing trigger was not rendered.');
		trigger.click();
		await tick();

		expect(target.querySelector('.photo-cropper img')?.getAttribute('src')).toBe(
			'/secretaria/cadastros/4/foto/original',
		);
		const cancelButton = [...target.querySelectorAll('button')].find((button) =>
			button.textContent?.includes('Cancelar'),
		);
		cancelButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await tick();
		await tick();

		expect(document.activeElement).toBe(target.querySelector('#reenquadrar-foto'));
		unmount(component);
	});
});
