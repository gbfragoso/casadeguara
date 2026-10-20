import { expect, type Browser, type Page } from '@playwright/test';

import { installHydrationProbe, waitForHydration } from '../fixtures-hydration';
import type { BaselineSeed } from './seed/state';
import type { RepresentativeScreen, ScreenState } from './types';

type Size = { width: number; height: number };
type StateWork = (page: Page) => Promise<void>;

const COLLECTOR_PATH = 'tests/e2e/baseline/inventory-collector.js';
const OK_STATUS = 200;

const openPath = async (page: Page, path: string, expectedStatus: number) => {
	const response = await page.goto(path);
	expect(response?.status(), `status de ${path}`).toBe(expectedStatus);
	await waitForHydration(page);
};

const enterState = async (page: Page, screen: RepresentativeScreen, state: ScreenState, seed: BaselineSeed) => {
	const path = screen.path(seed);
	if (state.open) await state.open(page, path);
	else await openPath(page, path, screen.status ?? OK_STATUS);
	await state.prepare?.(page, seed);
};

const runWithoutHold = (work: () => Promise<void>) => work();

export const runInState = async (
	browser: Browser,
	target: { screen: RepresentativeScreen; state: ScreenState; seed: BaselineSeed },
	initialSize: Size,
	work: StateWork,
) => {
	const { screen, state, seed } = target;
	const storageState = screen.role === 'public' ? undefined : seed.storageStates[screen.role];
	const context = await browser.newContext({ storageState, viewport: initialSize });
	try {
		const page = await context.newPage();
		await installHydrationProbe(page);
		await page.addInitScript({ path: COLLECTOR_PATH });
		await (state.hold ?? runWithoutHold)(async () => {
			await enterState(page, screen, state, seed);
			await work(page);
		});
	} finally {
		await context.close();
	}
};
