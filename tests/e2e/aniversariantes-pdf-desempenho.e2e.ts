import type { Page } from '@playwright/test';

import {
	chooseMonth,
	generatePdfButton,
	openBirthdaysPage,
	pdfStatus,
	readCurrentMonthOption,
	readFollowingMonthOption,
	readReferenceMonth,
	readyStatus,
	seedBirthdayWorkers,
} from './aniversariantes-support';
import { expect, test } from './fixtures';
import { emulateFast4G, percentile } from './support/network';

const GENERATION_COUNT = 20;
const SEEDED_WORKERS = 30;
const P95_PERCENTILE = 0.95;
const READY_BUDGET_MS = 3_000;
const PERFORMANCE_TIMEOUT_MS = 180_000;

const measuredOption = readCurrentMonthOption();
const resetOption = readFollowingMonthOption(measuredOption);
const measuredMonth = readReferenceMonth(measuredOption);

const measureGeneration = async (page: Page) => {
	const start = await page.evaluate(() => performance.now());
	await generatePdfButton(page).click();
	await readyStatus(page, measuredMonth).waitFor();
	const finish = await page.evaluate(() => performance.now());
	await chooseMonth(page, resetOption);
	await expect(pdfStatus(page)).toHaveCount(0);
	await chooseMonth(page, measuredOption);
	return finish - start;
};

test.describe('desempenho do PDF de aniversariantes', () => {
	test.describe.configure({ timeout: PERFORMANCE_TIMEOUT_MS });

	test(
		'E2E-03 mostra o PDF pronto em até 3 s no p95 com 4G rápida',
		{ tag: '@performance' },
		async ({ page, e2e }) => {
			await seedBirthdayWorkers(e2e, measuredOption, SEEDED_WORKERS);
			await openBirthdaysPage(page, e2e);
			await chooseMonth(page, measuredOption);
			await emulateFast4G(page);
			const durations: number[] = [];

			for (let index = 0; index < GENERATION_COUNT; index += 1) {
				durations.push(await measureGeneration(page));
			}

			const p95 = percentile(durations, P95_PERCENTILE);
			test.info().annotations.push({ type: 'p95-aniversariantes-ms', description: p95.toFixed(0) });
			expect(p95).toBeLessThanOrEqual(READY_BUDGET_MS);
		},
	);
});
