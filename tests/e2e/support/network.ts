import type { Page } from '@playwright/test';

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

export const percentile = (values: readonly number[], fraction: number) => {
	const sorted = values.toSorted((first, second) => first - second);
	return sorted[Math.ceil(sorted.length * fraction) - 1];
};

export const emulateFast4G = async (page: Page) => {
	const session = await page.context().newCDPSession(page);
	await session.send('Network.enable');
	await session.send('Network.emulateNetworkConditions', FAST_4G);
};
