// @vitest-environment happy-dom
import { mount, tick, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PhotoCropper from '$lib/components/image/PhotoCropper.svelte';

const pointerEvent = (type: string, init: Record<string, number | string>) => {
	const event = new Event(type, { bubbles: true });
	Object.entries(init).forEach(([key, value]) => Object.defineProperty(event, key, { value, configurable: true }));
	return event;
};

describe('PhotoCropper interactions', () => {
	let target: HTMLDivElement;

	beforeEach(() => {
		target = document.createElement('div');
		document.body.append(target);
	});

	afterEach(() => target.remove());

	it('updates position with keyboard, zoom, pointer drag, and reset', async () => {
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
			pointerEvent('pointerdown', { pointerId: 1, pointerType: 'touch', clientX: 100, clientY: 100 }),
		);
		frame.dispatchEvent(pointerEvent('pointermove', { pointerId: 1, clientX: 120, clientY: 130 }));
		frame.dispatchEvent(pointerEvent('pointerup', { pointerId: 1 }));
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
		const component = mount(PhotoCropper, { target, props: { src: 'blob:photo', onPositionChange } });
		await tick();
		const frame = target.querySelector('[role="button"]');
		if (!(frame instanceof HTMLDivElement)) throw new Error('Cropper frame was not rendered.');
		frame.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		frame.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2, pointerType: 'mouse', button: 2 }));
		frame.dispatchEvent(pointerEvent('pointermove', { pointerId: 2 }));
		frame.dispatchEvent(pointerEvent('pointerup', { pointerId: 2 }));
		frame.dispatchEvent(pointerEvent('pointerdown', { pointerId: 4, pointerType: 'touch' }));
		frame.dispatchEvent(pointerEvent('pointerup', { pointerId: 4 }));
		const disabled = mount(PhotoCropper, { target, props: { src: 'blob:photo', disabled: true } });
		await tick();
		target
			.querySelectorAll('[role="button"]')[1]
			?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
		target.querySelectorAll('[role="button"]')[1]?.dispatchEvent(pointerEvent('pointerdown', { pointerId: 3 }));

		expect(onPositionChange).not.toHaveBeenCalled();
		unmount(disabled);
		unmount(component);
	});
});
