import { afterEach, describe, expect, it, vi } from 'vitest';

import { copyArt, readDeliveryOptions, shareArt, type DeliveryPlatform } from '#lib/talks/art/delivery.js';

const image = new Blob(['png'], { type: 'image/png' });
const file = new File([image], 'palestra-2026-10-26-0845.png', { type: 'image/png' });

class FakeClipboardItem {
	static supports = (type: string) => type === 'image/png';
	constructor(readonly items: Record<string, Blob>) {}
}

const createPlatform = (navigator: DeliveryPlatform['navigator'] = {}, withClipboardItem = true) => ({
	navigator,
	ClipboardItem: withClipboardItem ? (FakeClipboardItem as unknown as DeliveryPlatform['ClipboardItem']) : undefined,
});

const createClipboard = (write: Clipboard['write'] = () => Promise.resolve()) =>
	({ write: vi.fn(write) }) as unknown as Clipboard;

afterEach(() => {
	vi.restoreAllMocks();
});

describe('TU-26 readDeliveryOptions', () => {
	it('offers sharing and copying where the platform supports image files', () => {
		const platform = createPlatform({ canShare: () => true, share: vi.fn(), clipboard: createClipboard() });

		expect(readDeliveryOptions(platform, file)).toEqual({ share: true, copy: true });
	});

	it('hides sharing where the platform cannot share the file', () => {
		const platform = createPlatform({ canShare: () => false, share: vi.fn(), clipboard: createClipboard() });

		expect(readDeliveryOptions(platform, file).share).toBe(false);
	});

	it('hides both options where the platform has neither feature', () => {
		const platform = createPlatform({}, false);

		expect(readDeliveryOptions(platform, file)).toEqual({ share: false, copy: false });
	});

	it('hides copying where the clipboard does not accept PNG images', () => {
		const platform = createPlatform({ clipboard: createClipboard() });
		vi.spyOn(FakeClipboardItem, 'supports').mockReturnValue(false);

		expect(readDeliveryOptions(platform, file).copy).toBe(false);
	});
});

describe('TU-26 shareArt', () => {
	it('shares the PNG file', async () => {
		const share = vi.fn<Navigator['share']>(() => Promise.resolve());

		const outcome = await shareArt(createPlatform({ share }), file);

		expect(outcome).toBe('shared');
		expect(share).toHaveBeenCalledWith({ files: [file] });
	});

	it('treats a dismissed share sheet as cancelled', async () => {
		const share = () => Promise.reject(new DOMException('Share canceled', 'AbortError'));

		const outcome = await shareArt(createPlatform({ share }), file);

		expect(outcome).toBe('cancelled');
	});

	it('reports any other share error as a failure', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const share = () => Promise.reject(new DOMException('Not allowed', 'NotAllowedError'));

		const outcome = await shareArt(createPlatform({ share }), file);

		expect(outcome).toBe('failed');
	});
});

describe('TU-26 copyArt', () => {
	it('writes the PNG to the clipboard', async () => {
		const clipboard = createClipboard();

		const outcome = await copyArt(createPlatform({ clipboard }), image);

		expect(outcome).toBe('copied');
		expect(clipboard.write).toHaveBeenCalledWith([new FakeClipboardItem({ 'image/png': image })]);
	});

	it('reports a rejected clipboard write as a failure', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const clipboard = createClipboard(() => Promise.reject(new DOMException('Denied', 'NotAllowedError')));

		const outcome = await copyArt(createPlatform({ clipboard }), image);

		expect(outcome).toBe('failed');
	});
});
