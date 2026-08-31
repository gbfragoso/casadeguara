// @vitest-environment happy-dom
import { mount, tick, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PhotoSection from '$lib/components/image/PhotoSection.svelte';

const fileList = (file: File) => Object.defineProperty({}, '0', { value: file, enumerable: true });
const clickCancel = (target: HTMLDivElement) => {
	const cancel = [...target.querySelectorAll('button')].find((button) => button.textContent?.includes('Cancelar'));
	cancel?.click();
};

vi.mock('$app/forms', () => ({ enhance: () => () => undefined }));

const nativeCreateObjectUrl = URL.createObjectURL;
const nativeRevokeObjectUrl = URL.revokeObjectURL;

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
		Object.defineProperty(URL, 'createObjectURL', { value: nativeCreateObjectUrl, configurable: true });
		Object.defineProperty(URL, 'revokeObjectURL', { value: nativeRevokeObjectUrl, configurable: true });
	});

	it('opens a local preview, cancels it, revokes the URL, and restores focus', async () => {
		const component = mount(PhotoSection, { target, props: { hasPhoto: false, alt: 'Foto de Maria' } });
		const input = target.querySelector('#foto');
		if (!(input instanceof HTMLInputElement)) throw new Error('Photo input was not rendered.');
		const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
		Object.defineProperty(input, 'files', { value: fileList(file), configurable: true });
		input.focus();
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await tick();
		expect(target.querySelector('[data-testid="photo-cropper"]')).not.toBeNull();
		clickCancel(target);
		await tick();

		expect(createObjectUrl).toHaveBeenCalledWith(file);
		expect(revokeObjectUrl).toHaveBeenCalledWith('blob:photo');
		expect(target.querySelector('[data-testid="photo-cropper"]')).toBeNull();
		expect(document.activeElement).toBe(input);
		unmount(component);
	});

	it('rejects an unsupported file and preserves an existing photo', async () => {
		const component = mount(PhotoSection, { target, props: { hasPhoto: true, alt: 'Foto de Maria' } });
		const input = target.querySelector('#foto');
		if (!(input instanceof HTMLInputElement)) throw new Error('Photo input was not rendered.');
		Object.defineProperty(input, 'files', {
			value: fileList(new File(['text'], 'photo.txt', { type: 'text/plain' })),
			configurable: true,
		});
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await tick();

		expect(target.querySelector('[role="alert"]')?.textContent).toContain('A foto deve ser JPEG ou PNG');
		expect(target.querySelector('img[alt="Foto de Maria"]')).not.toBeNull();
		unmount(component);
	});

	it('returns focus to the reframing trigger after canceling', async () => {
		const component = mount(PhotoSection, {
			target,
			props: { hasPhoto: true, alt: 'Foto de Maria', photoUrl: '/foto', originalPhotoUrl: '/foto/original' },
		});
		const trigger = target.querySelector('#reenquadrar-foto');
		if (!(trigger instanceof HTMLButtonElement)) throw new Error('Reframing trigger was not rendered.');
		trigger.click();
		await tick();
		expect(target.querySelector('.photo-cropper img')?.getAttribute('src')).toBe('/foto/original');
		clickCancel(target);
		await tick();
		await tick();

		expect(document.activeElement).toBe(target.querySelector('#reenquadrar-foto'));
		unmount(component);
	});
});
