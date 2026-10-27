import type { Page } from '@playwright/test';

import type { ProgramMonth } from '../../src/lib/talks/program/months';
import { expect, test } from './fixtures';
import { openBoard } from './palestras-browser';
import {
	expectOfferedMonths,
	monthOption,
	programAction,
	programDialog,
	readProgramMonths,
	readyStatus,
	seedCompleteMonth,
} from './palestras-programacao-support';
import { emulateFast4G, percentile } from './support/network';

const GENERATION_COUNT = 20;
const SEEDED_TALKS = 15;
const P95_PERCENTILE = 0.95;
const READY_BUDGET_MS = 3_000;
const PERFORMANCE_TIMEOUT_MS = 180_000;

const [currentMonth] = readProgramMonths();

const measureGeneration = async (page: Page, month: ProgramMonth) => {
	await programAction(page).click();
	const start = await page.evaluate(() => performance.now());
	await monthOption(page, month).click();
	await readyStatus(page, month).waitFor();
	const finish = await page.evaluate(() => performance.now());
	await page.keyboard.press('Escape');
	await expect(programDialog(page)).toBeHidden();
	return finish - start;
};

test.describe('desempenho da programação de palestras', () => {
	test.describe.configure({ timeout: PERFORMANCE_TIMEOUT_MS });

	test(
		'E2E-03 mostra o PDF pronto em até 3 s no p95 com 4G rápida',
		{ tag: '@performance' },
		async ({ page, e2e }) => {
			await e2e.authenticate(page, 'comunicacao');
			await openBoard(page);
			await programAction(page).click();
			await expectOfferedMonths(page, readProgramMonths());
			await seedCompleteMonth(e2e, currentMonth, SEEDED_TALKS);
			await page.keyboard.press('Escape');
			await emulateFast4G(page);
			const durations: number[] = [];

			for (let index = 0; index < GENERATION_COUNT; index += 1) {
				durations.push(await measureGeneration(page, currentMonth));
			}

			const p95 = percentile(durations, P95_PERCENTILE);
			test.info().annotations.push({ type: 'p95-programacao-ms', description: p95.toFixed(0) });
			expect(p95).toBeLessThanOrEqual(READY_BUDGET_MS);
		},
	);
});
