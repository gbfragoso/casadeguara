import type { Browser, BrowserContext, Page } from '@playwright/test';

export const TREASURY_DEVICE = {
	viewport: { width: 375, height: 667 },
	deviceScaleFactor: 2,
	hasTouch: true,
	isMobile: true,
} as const;

export const CPU_THROTTLE_RATE = 4;

type LongTaskWindow = Window & { __treasuryLongTasks?: number[] };

export type LongTaskSample = {
	durations: number[];
	maxMs: number;
};

type PreparePage = (page: Page) => Promise<void>;

function installLongTaskObserver() {
	const target = window as LongTaskWindow;
	target.__treasuryLongTasks = [];
	if (!('PerformanceObserver' in window)) return;
	const observer = new PerformanceObserver((list) => {
		target.__treasuryLongTasks?.push(...list.getEntries().map((entry) => entry.duration));
	});
	observer.observe({ type: 'longtask', buffered: true });
}

async function waitForPaint(page: Page) {
	await page.waitForFunction(() => document.readyState === 'complete');
	await page.evaluate(
		() =>
			new Promise<void>((resolve) => {
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
			}),
	);
}

async function readSample(page: Page): Promise<LongTaskSample> {
	const durations = await page.evaluate(() => (window as LongTaskWindow).__treasuryLongTasks?.slice() ?? []);
	return { durations, maxMs: durations.length === 0 ? 0 : Math.max(...durations) };
}

async function captureContextSample(browser: Browser, preparePage: PreparePage, path: string): Promise<LongTaskSample> {
	const context: BrowserContext = await browser.newContext(TREASURY_DEVICE);
	try {
		await context.addInitScript(installLongTaskObserver);
		const page = await context.newPage();
		const session = await context.newCDPSession(page);
		await session.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE_RATE });
		await preparePage(page);
		await page.goto(path, { waitUntil: 'load' });
		await waitForPaint(page);
		return await readSample(page);
	} finally {
		await context.close();
	}
}

export async function captureLongTaskSamples(
	browser: Browser,
	preparePage: PreparePage,
	sampleCount = 5,
	path = '/tesouraria',
) {
	const samples: LongTaskSample[] = [];
	for (let index = 0; index < sampleCount; index += 1) {
		samples.push(await captureContextSample(browser, preparePage, path));
	}
	return samples;
}
