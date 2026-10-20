import { join } from 'node:path';

import type { Page } from '@playwright/test';

import { capturesDirectory, type EvidenceLabel } from './evidence';
import type { CaptureViewport, RepresentativeScreen, ScreenState } from './types';

const PRINT_SUFFIX = 'impressao';

export const captureFileName = (screen: RepresentativeScreen, state: ScreenState, viewport: CaptureViewport) => {
	const variant = viewport.media === 'print' ? PRINT_SUFFIX : viewport.scheme;
	return `${screen.id}-${state.id}-${viewport.width}x${viewport.height}-${variant}.png`;
};

export const applyViewport = async (page: Page, viewport: CaptureViewport) => {
	await page.setViewportSize({ width: viewport.width, height: viewport.height });
	await page.emulateMedia({ colorScheme: viewport.scheme, media: viewport.media });
	await page.evaluate(async () => {
		await document.fonts.ready;
	});
};

export const captureScreen = async (
	page: Page,
	target: { screen: RepresentativeScreen; state: ScreenState },
	viewport: CaptureViewport,
	label: EvidenceLabel,
) => {
	await applyViewport(page, viewport);
	await page.screenshot({
		path: join(capturesDirectory(label), captureFileName(target.screen, target.state, viewport)),
		fullPage: true,
		animations: 'disabled',
		caret: 'hide',
	});
};
