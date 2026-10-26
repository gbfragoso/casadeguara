type ClipboardItemConstructor = {
	new (items: Record<string, Blob>): ClipboardItem;
	supports?: (type: string) => boolean;
};

export type DeliveryPlatform = {
	navigator: Partial<Pick<Navigator, 'share' | 'canShare' | 'clipboard'>>;
	ClipboardItem?: ClipboardItemConstructor;
};

export type DeliveryOptions = { share: boolean; copy: boolean };

const ART_TYPE = 'image/png';

export const readBrowserPlatform = (): DeliveryPlatform => ({
	navigator,
	ClipboardItem: 'ClipboardItem' in globalThis ? globalThis.ClipboardItem : undefined,
});

const canCopyImage = ({ navigator: { clipboard }, ClipboardItem: Item }: DeliveryPlatform) =>
	typeof clipboard?.write === 'function' && Item !== undefined && (Item.supports?.(ART_TYPE) ?? true);

export const readDeliveryOptions = (platform: DeliveryPlatform, file: File): DeliveryOptions => ({
	share: platform.navigator.canShare?.({ files: [file] }) === true,
	copy: canCopyImage(platform),
});

const isAbort = (cause: unknown) => cause instanceof DOMException && cause.name === 'AbortError';

export const shareArt = async (
	{ navigator }: DeliveryPlatform,
	file: File,
): Promise<'shared' | 'cancelled' | 'failed'> => {
	try {
		if (!navigator.share) throw new Error('Compartilhamento de arquivos indisponível.');
		await navigator.share({ files: [file] });
		return 'shared';
	} catch (cause) {
		if (isAbort(cause)) return 'cancelled';
		console.error('comunicacao.palestras.arte_compartilhamento_falhou', { error: cause });
		return 'failed';
	}
};

export const copyArt = async (
	{ navigator, ClipboardItem: Item }: DeliveryPlatform,
	image: Blob,
): Promise<'copied' | 'failed'> => {
	try {
		if (!navigator.clipboard || !Item) throw new Error('Cópia de imagens indisponível.');
		await navigator.clipboard.write([new Item({ [ART_TYPE]: image })]);
		return 'copied';
	} catch (cause) {
		console.error('comunicacao.palestras.arte_copia_falhou', { error: cause });
		return 'failed';
	}
};
