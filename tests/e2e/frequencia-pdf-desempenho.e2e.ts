import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import {
	fillAttendanceRequest,
	generatePdfButton,
	openAttendancePage,
	pdfStatus,
	readyStatus,
	seedAttendanceWorkers,
	titleInput,
} from './frequencia-support';
import { emulateFast4G, percentile } from './support/network';

const GENERATION_COUNT = 20;
const SEEDED_WORKERS = 300;
const P95_PERCENTILE = 0.95;
const READY_BUDGET_MS = 3_000;
const PERFORMANCE_TIMEOUT_MS = 180_000;
const FIFTEEN_DATES_REQUEST = { title: 'Lista de presença', start: '2026-11-01', end: '2026-12-03' };

const measureGeneration = async (page: Page, round: number) => {
	await titleInput(page).fill(`${FIFTEEN_DATES_REQUEST.title} ${round}`);
	await expect(pdfStatus(page)).toHaveCount(0);
	const start = await page.evaluate(() => performance.now());
	await generatePdfButton(page).click();
	await readyStatus(page).waitFor();
	const finish = await page.evaluate(() => performance.now());
	return finish - start;
};

test.describe('desempenho do PDF da lista de frequência', () => {
	test.describe.configure({ timeout: PERFORMANCE_TIMEOUT_MS });

	test(
		'E2E-05 mostra o PDF de 300 trabalhadores e 15 datas em até 3 s no p95 com 4G rápida',
		{ tag: '@performance' },
		async ({ page, e2e }) => {
			await seedAttendanceWorkers(e2e, SEEDED_WORKERS);
			await openAttendancePage(page, e2e);
			await fillAttendanceRequest(page, FIFTEEN_DATES_REQUEST);
			await emulateFast4G(page);
			const durations: number[] = [];

			for (let round = 0; round < GENERATION_COUNT; round += 1) {
				durations.push(await measureGeneration(page, round));
			}

			const p95 = percentile(durations, P95_PERCENTILE);
			test.info().annotations.push({ type: 'p95-frequencia-ms', description: p95.toFixed(0) });
			expect(p95).toBeLessThanOrEqual(READY_BUDGET_MS);
		},
	);
});
