import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { test, expect } from './fixtures';
import { captureClientEnvironment } from '../../src/lib/scripts/performance/tesouraria/environment';
import { captureLongTaskSamples } from '../../src/lib/scripts/performance/tesouraria/longtasks';
import { writeBaselineReport } from '../../src/lib/scripts/performance/tesouraria/report';
import type { BundleMeasurement } from '../../src/lib/scripts/performance/tesouraria/bundle';

test.describe('prova técnica do gráfico da tesouraria', () => {
	test.use({ hasTouch: true, viewport: { width: 320, height: 667 } });

	test('monta, desmonta, remonta e seleciona uma competência por toque', async ({ page }) => {
		await page.goto('/__test/tesouraria-chart', { waitUntil: 'load' });

		await expect(page.locator('canvas')).toBeVisible();
		await expect(page.locator('html')).toHaveAttribute('data-proof-mounted', 'true');
		await expect(page.locator('html')).toHaveAttribute('data-proof-unmounted', 'true');
		await expect(page.locator('html')).toHaveAttribute('data-proof-remounted', 'true');
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

		const canvas = page.locator('canvas');
		const bounds = await canvas.boundingBox();
		if (!bounds) throw new Error('Canvas da prova não possui geometria.');
		await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
		await expect(page.locator('#proof-selection')).not.toHaveText('Nenhuma competência selecionada');
	});

	test('registra cinco amostras frias de tarefas longas para o baseline', async ({ browser, e2e }) => {
		const samples = await captureLongTaskSamples(browser, (page) => e2e.authenticate(page, 'tesouraria'));
		const bundlePath = resolve('src/lib/scripts/performance/tesouraria/baseline-bundle.json');
		const bundle = JSON.parse(await readFile(bundlePath, 'utf8')) as BundleMeasurement;
		await writeBaselineReport({
			environment: captureClientEnvironment(browser.version()),
			bundle,
			longTasks: samples,
		});

		expect(samples).toHaveLength(5);
		expect(samples.every(({ durations }) => durations.every((duration) => duration >= 0))).toBe(true);
	});
});
