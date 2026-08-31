// @vitest-environment happy-dom
import { mount, tick, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PhotoSection from '$lib/components/image/PhotoSection.svelte';

const fileList = (file: File) => Object.defineProperty({}, '0', { value: file, enumerable: true });

vi.mock('$app/forms', () => ({ enhance: () => () => undefined }));

const nativeCreateObjectUrl = URL.createObjectURL;
const nativeRevokeObjectUrl = URL.revokeObjectURL;

describe('PhotoSection preview lifecycle', () => {
	let target: HTMLDivElement;
	let revokeObjectUrl: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		target = document.createElement('div');
		document.body.append(target);
		revokeObjectUrl = vi.fn();
		Object.defineProperty(URL, 'createObjectURL', { value: vi.fn(() => 'blob:photo'), configurable: true });
		Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectUrl, configurable: true });
	});

	afterEach(() => {
		target.remove();
		Object.defineProperty(URL, 'createObjectURL', { value: nativeCreateObjectUrl, configurable: true });
		Object.defineProperty(URL, 'revokeObjectURL', { value: nativeRevokeObjectUrl, configurable: true });
	});

	it('revokes the previous preview when selecting another file and on destroy', async () => {
		const component = mount(PhotoSection, { target, props: { hasPhoto: false, alt: 'Foto de Maria' } });
		const input = target.querySelector('#foto');
		if (!(input instanceof HTMLInputElement)) throw new Error('Photo input was not rendered.');
		Object.defineProperty(input, 'files', {
			value: fileList(new File(['first'], 'first.jpg', { type: 'image/jpeg' })),
			configurable: true,
		});
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await tick();
		Object.defineProperty(input, 'files', {
			value: fileList(new File(['second'], 'second.jpg', { type: 'image/jpeg' })),
			configurable: true,
		});
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await tick();

		expect(revokeObjectUrl).toHaveBeenCalledWith('blob:photo');
		expect(revokeObjectUrl).toHaveBeenCalledTimes(1);
		unmount(component);
		expect(revokeObjectUrl).toHaveBeenCalledTimes(2);
	});
});
