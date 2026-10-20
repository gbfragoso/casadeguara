import type { CaptureViewport, InventoryViewport, Region, RepresentativeScreen, ScreenState } from './types';

type Size = { width: number; height: number };

const LIGHT_SIZES: readonly Size[] = [
	{ width: 390, height: 844 },
	{ width: 820, height: 1180 },
	{ width: 1024, height: 768 },
	{ width: 1366, height: 768 },
	{ width: 1920, height: 1080 },
];
const DARK_SIZE: Size = { width: 1366, height: 768 };
const PRINT_SIZE: Size = { width: 794, height: 1123 };
const INVENTORY_SIZES: readonly (Size & { viewport: InventoryViewport })[] = [
	{ viewport: '1366x768', width: 1366, height: 768 },
	{ viewport: '390x844', width: 390, height: 844 },
];
const DESKTOP_MIN_WIDTH = 1024;
const SCHEMES: readonly CaptureViewport['scheme'][] = ['light', 'dark'];

const existsAt = (state: ScreenState, size: Size) => state.widths?.includes(size.width) ?? true;
const printsState = (screen: RepresentativeScreen, state: ScreenState) => state.print ?? screen.print ?? false;

export const captureViewports = (screen: RepresentativeScreen, state: ScreenState): CaptureViewport[] => {
	const light = LIGHT_SIZES.filter((size) => existsAt(state, size)).map((size): CaptureViewport => ({
		...size,
		scheme: 'light',
		media: 'screen',
	}));
	const dark: CaptureViewport[] = existsAt(state, DARK_SIZE)
		? [{ ...DARK_SIZE, scheme: 'dark', media: 'screen' }]
		: [];
	const print: CaptureViewport[] = printsState(screen, state)
		? [{ ...PRINT_SIZE, scheme: 'light', media: 'print' }]
		: [];
	return [...light, ...dark, ...print];
};

export const inventoryViewports = (state: ScreenState) => INVENTORY_SIZES.filter((size) => existsAt(state, size));

export const prototypeViewports = (print: boolean): CaptureViewport[] => [
	...INVENTORY_SIZES.flatMap(({ width, height }) =>
		SCHEMES.map((scheme): CaptureViewport => ({ width, height, scheme, media: 'screen' })),
	),
	...(print ? [{ ...PRINT_SIZE, scheme: 'light', media: 'print' } satisfies CaptureViewport] : []),
];

export const expectedRegions = (screen: RepresentativeScreen, state: ScreenState, width: number): Region[] => {
	const shellRegions: Region[] = width >= DESKTOP_MIN_WIDTH ? ['menu-lateral', 'barra-superior'] : ['barra-superior'];
	const regions = new Set<Region>([...(screen.shell ? shellRegions : []), 'conteudo', ...(state.extraRegions ?? [])]);
	return [...regions].sort();
};
