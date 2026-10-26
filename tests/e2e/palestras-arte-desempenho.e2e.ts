import type { Locator, Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { artAction, artDialog, artPreview } from './palestras-browser';
import { openReadyCard } from './palestras-arte-support';

const GENERATION_COUNT = 20;
const P95_PERCENTILE = 0.95;
const PREVIEW_BUDGET_MS = 3_000;
const PERFORMANCE_TIMEOUT_MS = 180_000;
const BYTES_PER_MEGABIT = 125_000;
// Chrome DevTools "Fast 4G" preset, including the throughput and latency factors DevTools applies to it.
const FAST_4G_DOWNLOAD_MBPS = 9;
const FAST_4G_UPLOAD_MBPS = 1.5;
const FAST_4G_RTT_MS = 60;
const DEVTOOLS_THROUGHPUT_FACTOR = 0.9;
const DEVTOOLS_LATENCY_FACTOR = 2.75;
const toBytesPerSecond = (megabits: number) => megabits * BYTES_PER_MEGABIT * DEVTOOLS_THROUGHPUT_FACTOR;
const FAST_4G = {
	offline: false,
	downloadThroughput: toBytesPerSecond(FAST_4G_DOWNLOAD_MBPS),
	uploadThroughput: toBytesPerSecond(FAST_4G_UPLOAD_MBPS),
	latency: FAST_4G_RTT_MS * DEVTOOLS_LATENCY_FACTOR,
};

const percentile = (values: readonly number[], fraction: number) => {
	const sorted = values.toSorted((first, second) => first - second);
	return sorted[Math.ceil(sorted.length * fraction) - 1];
};

const emulateFast4G = async (page: Page) => {
	const session = await page.context().newCDPSession(page);
	await session.send('Network.enable');
	await session.send('Network.emulateNetworkConditions', FAST_4G);
};

const measurePreview = async (page: Page, action: Locator) => {
	const start = await page.evaluate(() => performance.now());
	await action.click();
	const finish = await artPreview(page).evaluate(async (image: HTMLImageElement) => {
		await image.decode();
		return performance.now();
	});
	await page.keyboard.press('Escape');
	await expect(artDialog(page)).toBeHidden();
	return finish - start;
};

test.describe('desempenho da arte de divulgação', () => {
	test.describe.configure({ timeout: PERFORMANCE_TIMEOUT_MS });

	test('E2E-09 mostra a prévia em até 3 s no p95 com 4G emulada', { tag: '@performance' }, async ({ page, e2e }) => {
		const card = await openReadyCard(page, e2e);
		await emulateFast4G(page);
		const action = artAction(card);
		const durations: number[] = [];

		for (let index = 0; index < GENERATION_COUNT; index += 1) {
			durations.push(await measurePreview(page, action));
		}

		const p95 = percentile(durations, P95_PERCENTILE);
		test.info().annotations.push({ type: 'p95-previa-ms', description: p95.toFixed(0) });
		expect(p95).toBeLessThanOrEqual(PREVIEW_BUDGET_MS);
	});
});
