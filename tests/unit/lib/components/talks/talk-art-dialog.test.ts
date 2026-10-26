// @vitest-environment happy-dom
import { tick, type ComponentProps } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import TalkArtDialog from '#lib/components/talks/TalkArtDialog.svelte';
import type { DeliveryPlatform } from '#lib/talks/art/delivery.js';
import { checkTalkArtReadiness } from '#lib/talks/art/readiness.js';
import { getElement, renderComponent } from '../support/render-component.js';
import { buildTalk } from './talk-fixtures';

type DialogProps = ComponentProps<typeof TalkArtDialog>;

const DIALOG_ID = 'palestra-31-arte';
const ART_DESCRIPTION = 'Arte de divulgação da palestra “A prece”, em 26/10/2026, às 08h45, com Carmélia Amorim.';
const CONFLICT_MESSAGE = 'Outra pessoa alterou esta programação. O board foi atualizado; confira e tente de novo.';

class FakeClipboardItem {
	constructor(readonly items: Record<string, Blob>) {}
}

const readyTalk = () => {
	const readiness = checkTalkArtReadiness(buildTalk({ data: '2026-10-26' }));
	if (!readiness.ready) throw new Error('A palestra de teste deveria estar pronta.');
	return readiness.talk;
};

const createPlatform = (navigator: DeliveryPlatform['navigator'] = {}): DeliveryPlatform => ({
	navigator,
	ClipboardItem: navigator.clipboard
		? (FakeClipboardItem as unknown as DeliveryPlatform['ClipboardItem'])
		: undefined,
});

const createClipboard = (write: Clipboard['write'] = () => Promise.resolve()) =>
	({ write: vi.fn(write) }) as unknown as Clipboard;

const servePng = () =>
	vi.fn<typeof fetch>(() => Promise.resolve(new Response(new Blob(['png'], { type: 'image/png' }))));

const renderDialog = (props: Partial<DialogProps> = {}) =>
	renderComponent(TalkArtDialog, {
		id: DIALOG_ID,
		talk: readyTalk(),
		onStale: vi.fn(() => Promise.resolve()),
		fetcher: servePng(),
		platform: createPlatform(),
		...props,
	});

const toggleDialog = async (newState: 'open' | 'closed') => {
	const dialog = getElement(document, `#${DIALOG_ID}`, HTMLElement);
	dialog.dispatchEvent(Object.assign(new Event('toggle'), { newState }));
	await tick();
	return dialog;
};

const openPreview = async (target: HTMLElement) => {
	await toggleDialog('open');
	await vi.waitFor(() => getElement(target, 'img', HTMLImageElement));
};

const readButtons = (target: HTMLElement) =>
	[...target.querySelectorAll('a, button')].map((control) => control.textContent?.trim());

const findButton = (target: HTMLElement, text: string) => {
	const button = [...target.querySelectorAll('button')].find((control) => control.textContent?.trim() === text);
	if (!button) throw new Error(`Botão não encontrado: ${text}`);
	return button;
};

const readNotice = (target: HTMLElement, role: 'status' | 'alert') =>
	target.querySelector(`[role="${role}"]`)?.textContent?.trim();

afterEach(() => {
	vi.restoreAllMocks();
});

describe('TU-31 TalkArtDialog', () => {
	it('announces the generation and focuses the dialog when it opens', async () => {
		const target = await renderDialog({ fetcher: vi.fn<typeof fetch>(() => new Promise(() => undefined)) });

		const dialog = await toggleDialog('open');

		expect(readNotice(target, 'status')).toBe('Gerando a arte…');
		expect(document.activeElement).toBe(dialog);
	});

	it('previews the art with a text alternative', async () => {
		const target = await renderDialog();

		await openPreview(target);

		const preview = getElement(target, 'img', HTMLImageElement);
		expect(preview.alt).toBe(ART_DESCRIPTION);
		expect(preview.src).toMatch(/^blob:/);
	});

	it('downloads the previewed image with the dated file name', async () => {
		const target = await renderDialog();

		await openPreview(target);

		const download = getElement(target, 'a[download]', HTMLAnchorElement);
		expect(download.getAttribute('download')).toBe('palestra-2026-10-26-0845.png');
		expect(download.href).toBe(getElement(target, 'img', HTMLImageElement).src);
	});

	it('offers only downloading where the device cannot share or copy images', async () => {
		const target = await renderDialog();

		await openPreview(target);

		expect(readButtons(target)).toEqual(['Baixar', 'Fechar']);
	});

	it('offers sharing and copying where the device supports them', async () => {
		const platform = createPlatform({ canShare: () => true, share: vi.fn(), clipboard: createClipboard() });
		const target = await renderDialog({ platform });

		await openPreview(target);

		expect(readButtons(target)).toEqual(['Baixar', 'Compartilhar', 'Copiar', 'Fechar']);
	});

	it('shares the PNG file with its dated name', async () => {
		const share = vi.fn<Navigator['share']>(() => Promise.resolve());
		const target = await renderDialog({ platform: createPlatform({ canShare: () => true, share }) });
		await openPreview(target);

		findButton(target, 'Compartilhar').click();

		await vi.waitFor(() => expect(share).toHaveBeenCalledOnce());
		const [file] = share.mock.calls[0][0]?.files ?? [];
		expect([file?.name, file?.type]).toEqual(['palestra-2026-10-26-0845.png', 'image/png']);
	});

	it('suggests downloading when sharing fails', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const share = () => Promise.reject(new DOMException('Denied', 'NotAllowedError'));
		const target = await renderDialog({ platform: createPlatform({ canShare: () => true, share }) });
		await openPreview(target);

		findButton(target, 'Compartilhar').click();

		await vi.waitFor(() =>
			expect(readNotice(target, 'alert')).toBe(
				'Não foi possível compartilhar a imagem. Use “Baixar” para salvar a arte.',
			),
		);
	});

	it('confirms that the image was copied', async () => {
		const target = await renderDialog({ platform: createPlatform({ clipboard: createClipboard() }) });
		await openPreview(target);

		findButton(target, 'Copiar').click();

		await vi.waitFor(() => expect(readNotice(target, 'status')).toBe('Imagem copiada.'));
	});

	it('suggests downloading when copying fails', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const clipboard = createClipboard(() => Promise.reject(new DOMException('Denied', 'NotAllowedError')));
		const target = await renderDialog({ platform: createPlatform({ clipboard }) });
		await openPreview(target);

		findButton(target, 'Copiar').click();

		await vi.waitFor(() =>
			expect(readNotice(target, 'alert')).toBe(
				'Não foi possível copiar a imagem. Use “Baixar” para salvar a arte.',
			),
		);
	});

	it('refreshes the board when the talk changed after it was shown', async () => {
		const onStale = vi.fn(() => Promise.resolve());
		const fetcher = vi.fn<typeof fetch>(() =>
			Promise.resolve(Response.json({ message: CONFLICT_MESSAGE }, { status: 409 })),
		);
		const target = await renderDialog({ fetcher, onStale });

		await toggleDialog('open');

		await vi.waitFor(() => expect(onStale).toHaveBeenCalledOnce());
		expect(readNotice(target, 'alert')).toBe(CONFLICT_MESSAGE);
	});

	it('shows the generation failure without refreshing the board', async () => {
		const onStale = vi.fn(() => Promise.resolve());
		const fetcher = vi.fn<typeof fetch>(() => Promise.resolve(new Response('', { status: 500 })));
		const target = await renderDialog({ fetcher, onStale });

		await toggleDialog('open');

		await vi.waitFor(() =>
			expect(readNotice(target, 'alert')).toBe('Não foi possível gerar a arte. Tente novamente.'),
		);
		expect(onStale).not.toHaveBeenCalled();
	});

	it('releases the preview when the dialog closes', async () => {
		const revoke = vi.spyOn(URL, 'revokeObjectURL');
		const target = await renderDialog();
		await openPreview(target);
		const url = getElement(target, 'img', HTMLImageElement).src;

		await toggleDialog('closed');

		expect(revoke).toHaveBeenCalledWith(url);
		expect(target.querySelector('img')).toBeNull();
	});

	it('ignores an art that arrives after the dialog closed', async () => {
		let deliver: (response: Response) => void = () => undefined;
		const fetcher = vi.fn<typeof fetch>(() => new Promise((resolve) => (deliver = resolve)));
		const target = await renderDialog({ fetcher });
		await toggleDialog('open');
		await toggleDialog('closed');

		deliver(new Response(new Blob(['png'], { type: 'image/png' })));
		await tick();

		expect(fetcher.mock.calls[0][1]?.signal?.aborted).toBe(true);
		expect(target.querySelector('img')).toBeNull();
	});
});
