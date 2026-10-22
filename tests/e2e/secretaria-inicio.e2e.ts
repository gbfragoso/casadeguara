import type { Locator } from '@playwright/test';

import { expect, test } from './fixtures';
import { holdAttendanceLock } from './support/attendance-lock';
import { readBox } from './support/geometry';

const INDICATOR_LABELS = ['Trabalhadores', /Frequência em [a-zç]+ de \d{4}/];
const BOX_TOLERANCE = 1;

type Box = Awaited<ReturnType<typeof readBox>>;

const expectSameBox = (before: Box, after: Box) => {
	for (const key of ['x', 'y', 'width', 'height'] as const) {
		expect(Math.abs(after[key] - before[key])).toBeLessThanOrEqual(BOX_TOLERANCE);
	}
};

const expectLabels = async (indicators: Locator) => {
	for (const [index, label] of INDICATOR_LABELS.entries()) {
		await expect(indicators.nth(index).getByText(label)).toBeVisible();
	}
};

test.describe('página inicial da secretaria', () => {
	test(
		'E2E-12 exibe o esqueleto nos indicadores durante o carregamento real',
		{ tag: '@isolated' },
		async ({ page, e2e }) => {
			await e2e.authenticate(page, 'owner');
			const indicators = page.getByTestId('indicadores').getByRole('article');
			let loadingBoxes: Box[] = [];

			await holdAttendanceLock(e2e.database, async () => {
				await page.goto('/secretaria', { waitUntil: 'commit' });
				await expect(indicators).toHaveCount(INDICATOR_LABELS.length);
				await expectLabels(indicators);
				for (const indicator of await indicators.all()) {
					await expect(indicator.locator(':scope > div[aria-hidden="true"]')).toBeVisible();
					await expect(indicator.getByRole('heading', { level: 2 })).toHaveCount(0);
				}
				loadingBoxes = await Promise.all((await indicators.all()).map(readBox));
			});

			for (const [index, indicator] of (await indicators.all()).entries()) {
				await expect(indicator.getByRole('heading', { level: 2 })).toBeVisible();
				expectSameBox(loadingBoxes[index], await readBox(indicator));
			}
		},
	);
});
