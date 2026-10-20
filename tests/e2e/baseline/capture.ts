import { join } from 'node:path';

import type { Page } from '@playwright/test';

import { capturesDirectory, type EvidenceLabel } from './evidence';
import type { CaptureViewport } from './types';

const PRINT_SUFFIX = 'impressao';

export type CaptureTarget = { screenId: string; stateId: string };

export const captureFileName = ({ screenId, stateId }: CaptureTarget, viewport: CaptureViewport) => {
	const variant = viewport.media === 'print' ? PRINT_SUFFIX : viewport.scheme;
	return `${screenId}-${stateId}-${viewport.width}x${viewport.height}-${variant}.png`;
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
	target: CaptureTarget,
	viewport: CaptureViewport,
	label: EvidenceLabel,
) => {
	await applyViewport(page, viewport);
	await page.screenshot({
		path: join(capturesDirectory(label), captureFileName(target, viewport)),
		fullPage: true,
		animations: 'disabled',
		caret: 'hide',
	});
};
