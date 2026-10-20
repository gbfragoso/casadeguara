import type { Page } from '@playwright/test';

import type { BaselineSeed } from './seed/state';

export type Region = 'menu-lateral' | 'barra-superior' | 'notificacao' | 'conteudo';
export type InventoryViewport = '1366x768' | '390x844';

export type ScreenState = {
	id: string;
	widths?: readonly number[];
	print?: boolean;
	extraRegions?: readonly Region[];
	open?: (page: Page, path: string) => Promise<void>;
	hold?: (work: () => Promise<void>) => Promise<void>;
	prepare?: (page: Page, seed: BaselineSeed) => Promise<void>;
};

export type RepresentativeScreen = {
	id: string;
	role: 'admin' | 'reader' | 'public';
	path: (seed: BaselineSeed) => string;
	states: readonly ScreenState[];
	print?: boolean;
	shell?: boolean;
	status?: number;
};

export type CaptureViewport = { width: number; height: number; scheme: 'light' | 'dark'; media: 'screen' | 'print' };

export type InventoryLabels = {
	ariaLabel: string | null;
	title: string | null;
	alt: string | null;
	placeholder: string | null;
	labelText: string | null;
};

export type InventoryEntry = {
	region: Region;
	kind: 'texto' | 'controle' | 'imagem' | 'rotulo';
	text: string | null;
	textTransform: string | null;
	role: string | null;
	labels: InventoryLabels;
	states: Record<string, string>;
	options: string[] | null;
};

export type InvariantInventory = {
	screen: string;
	state: string;
	viewport: InventoryViewport;
	entries: InventoryEntry[];
};
