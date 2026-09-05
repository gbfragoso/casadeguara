import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import type { Page } from '@playwright/test';

import { test, expect } from './fixtures';
import { measureTreasuryBundle } from '../../src/lib/scripts/performance/tesouraria/bundle';
import { captureClientEnvironment } from '../../src/lib/scripts/performance/tesouraria/environment';
import {
	compareLongTaskSamples,
	writeFinalPerformanceReport,
} from '../../src/lib/scripts/performance/tesouraria/final-report';
import { captureLongTaskSamples } from '../../src/lib/scripts/performance/tesouraria/longtasks';
import { writeBaselineReport } from '../../src/lib/scripts/performance/tesouraria/report';
import type { BundleMeasurement } from '../../src/lib/scripts/performance/tesouraria/bundle';
import type { LongTaskSample } from '../../src/lib/scripts/performance/tesouraria/longtasks';
import {
	findLancamentoRow,
	openLancamentosPage,
	reverseFromRow,
	searchLancamentosByDescription,
} from './lancamentos-browser';
import { createEntrySeed, createExitSeed } from './lancamentos-fixture';

const readChartAutoFiles = async (bundle: BundleMeasurement) => {
	const output = resolve('.svelte-kit/output/client');
	const matches = await Promise.all(
		bundle.files.map(async ({ file }) => {
			const source = await readFile(join(output, file), 'utf8');
			return source.includes('chart.js/auto') ? file : null;
		}),
	);
	return matches.filter((file): file is string => file !== null);
};

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

const openDashboard = async (page: Page) => {
	await page.goto('/tesouraria');
	await page.waitForLoadState('domcontentloaded');
	await page.getByRole('heading', { name: /Balan/ }).waitFor();
};

const dashboardRegion = (page: Page) => page.getByRole('region', { name: /Entradas e sa/ });

test.describe('protected dashboard chart integration', () => {
	test.describe.configure({ mode: 'serial' });

	test('T5 E2E-01 exibe o gráfico mensal sem detalhamento redundante', async ({ page, e2e }) => {
		const counterpart = await e2e.createParticipant('dashboard-pointer');
		await e2e.createLancamentos([
			createEntrySeed(e2e.token, 'dashboard-pointer', counterpart.id, {
				valor: '1234.56',
				dataLancamento: '2026-09-01',
			}),
			createExitSeed(e2e.token, 'dashboard-pointer', { valor: '789.01', dataLancamento: '2026-09-02' }),
		]);
		await e2e.authenticate(page, 'tesouraria');
		await openDashboard(page);

		const region = dashboardRegion(page);
		await expect(region).toBeVisible();
		await expect(region.locator('.legend')).toContainText('Entradas');
		await expect(region.locator('.legend')).toContainText('Saídas');
		const canvas = region.locator('canvas');
		await expect(canvas).toBeVisible();
		await expect(canvas).toHaveAttribute('role', 'presentation');
		await expect(region.locator('.selection')).toHaveCount(0);
		await expect(region.locator('details')).toHaveCount(0);
	});

	test('T5 E2E-02 keeps indicators and chart within the four widths', async ({ page, e2e }) => {
		const counterpart = await e2e.createParticipant('dashboard-responsive');
		await e2e.createLancamento(createEntrySeed(e2e.token, 'dashboard-responsive', counterpart.id));
		await e2e.authenticate(page, 'tesouraria');

		for (const width of [320, 375, 768, 1280]) {
			await page.setViewportSize({ width, height: 667 });
			await openDashboard(page);

			const region = dashboardRegion(page);
			const indicators = page.locator('.mt-2.columns');
			const legend = region.locator('.legend');
			const canvas = region.locator('canvas');
			const indicatorColumns = indicators.locator(':scope > .column');
			await expect(indicatorColumns).toHaveCount(5);
			await expect(canvas).toBeVisible();

			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

			const indicatorBoxes = await Promise.all(
				Array.from({ length: await indicatorColumns.count() }, (_, index) =>
					indicatorColumns.nth(index).boundingBox(),
				),
			);
			for (const box of indicatorBoxes) {
				if (!box) throw new Error('Dashboard card has no geometry.');
				expect(box.x).toBeGreaterThanOrEqual(-1);
				expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
			}
			for (let first = 0; first < indicatorBoxes.length; first += 1) {
				for (let second = first + 1; second < indicatorBoxes.length; second += 1) {
					const left = indicatorBoxes[first];
					const right = indicatorBoxes[second];
					if (!left || !right) continue;
					const overlaps =
						left.x < right.x + right.width &&
						left.x + left.width > right.x &&
						left.y < right.y + right.height &&
						left.y + left.height > right.y;
					expect(overlaps).toBe(false);
				}
			}

			const [indicatorBox, regionBox, legendBox, canvasBox] = await Promise.all([
				indicators.boundingBox(),
				region.boundingBox(),
				legend.boundingBox(),
				canvas.boundingBox(),
			]);
			if (!indicatorBox || !regionBox || !legendBox || !canvasBox) {
				throw new Error('Responsive dashboard element has no geometry.');
			}
			expect(regionBox.x + regionBox.width).toBeLessThanOrEqual(width + 1);
			expect(indicatorBox.y + indicatorBox.height).toBeLessThanOrEqual(regionBox.y + 1);
			expect(legendBox.y + legendBox.height).toBeLessThanOrEqual(canvasBox.y + 1);
		}
	});

	test.describe('T5 E2E-03 mantém o gráfico acionável por toque', () => {
		test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });

		test('toca a primeira, intermediária e última faixa sem painel redundante', async ({ page, e2e }) => {
			const counterpart = await e2e.createParticipant('dashboard-touch');
			await e2e.createLancamentos([
				createEntrySeed(e2e.token, 'dashboard-touch-first', counterpart.id, {
					valor: '101.01',
					dataLancamento: '2025-10-01',
				}),
				createExitSeed(e2e.token, 'dashboard-touch-first', { valor: '11.11', dataLancamento: '2025-10-01' }),
				createEntrySeed(e2e.token, 'dashboard-touch-middle', counterpart.id, {
					valor: '202.02',
					dataLancamento: '2026-03-01',
				}),
				createExitSeed(e2e.token, 'dashboard-touch-middle', { valor: '22.22', dataLancamento: '2026-03-01' }),
				createEntrySeed(e2e.token, 'dashboard-touch-last', counterpart.id, {
					valor: '303.03',
					dataLancamento: '2026-09-01',
				}),
				createExitSeed(e2e.token, 'dashboard-touch-last', { valor: '33.33', dataLancamento: '2026-09-01' }),
			]);
			await e2e.authenticate(page, 'tesouraria');
			await openDashboard(page);

			const region = dashboardRegion(page);
			const canvas = region.locator('canvas');
			const bounds = await canvas.boundingBox();
			if (!bounds) throw new Error('Touch canvas has no geometry.');

			for (const fraction of [0.18, 0.53, 0.96]) {
				await canvas.tap({ position: { x: bounds.width * fraction, y: bounds.height / 2 } });
				await expect(canvas).toBeVisible();
			}
			await expect(region.locator('.selection')).toHaveCount(0);
			await expect(region.locator('details')).toHaveCount(0);
		});
	});

	test('T5 E2E-04 oferece estado vazio e movimento reduzido', async ({ page, e2e }) => {
		await e2e.authenticate(page, 'tesouraria');
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await openDashboard(page);

		const region = dashboardRegion(page);
		await expect(region.getByRole('status')).toContainText(/lan.amentos ativos/);
		await expect(region.locator('canvas')).toHaveCount(0);

		const counterpart = await e2e.createParticipant('dashboard-reduced-motion');
		await e2e.createLancamento(createEntrySeed(e2e.token, 'dashboard-reduced-motion', counterpart.id));
		await page.reload();
		await page.getByRole('heading', { name: /Balan/ }).waitFor();
		const animations = await region
			.locator('canvas')
			.evaluateAll((canvases) => canvases.map((canvas) => getComputedStyle(canvas).animationName));
		expect(animations.every((name) => name === 'none')).toBe(true);
	});

	test('T5 E2E-05 protege o dashboard e atualiza a serie no recarregamento', async ({ page, e2e }) => {
		await e2e.authenticate(page, 'wrongRole');
		const denied = await page.goto('/tesouraria');
		expect(denied?.status()).toBe(403);

		const counterpart = await e2e.createParticipant('dashboard-reload');
		const firstSeed = createEntrySeed(e2e.token, 'dashboard-reload-first', counterpart.id, { valor: '100.00' });
		await e2e.createLancamento(firstSeed);
		await e2e.authenticate(page, 'tesouraria');
		await openDashboard(page);

		const region = dashboardRegion(page);
		await expect(region.locator('canvas')).toBeVisible();
		await expect(page.locator('.mt-2.columns > .column')).toHaveCount(5);

		const secondSeed = createEntrySeed(e2e.token, 'dashboard-reload-second', counterpart.id, { valor: '200.00' });
		await e2e.createLancamento(secondSeed);
		await page.reload();
		await page.getByRole('heading', { name: /Balan/ }).waitFor();
		await expect(region.locator('canvas')).toBeVisible();

		await openLancamentosPage(page);
		await searchLancamentosByDescription(page, e2e.token);
		await reverseFromRow(page, findLancamentoRow(page, secondSeed.descricao), 'Dashboard reload');
		await openDashboard(page);
		await expect(region.locator('canvas')).toBeVisible();
		await expect(page.locator('.mt-2.columns > .column')).toHaveCount(5);
	});

	test('E2E-06 cumpre os orcamentos do cliente', async ({ browser, e2e }) => {
		const baselineBundle = JSON.parse(
			await readFile(resolve('src/lib/scripts/performance/tesouraria/baseline-bundle.json'), 'utf8'),
		) as BundleMeasurement;
		const baselineLongTasks = JSON.parse(
			await readFile(resolve('src/lib/scripts/performance/tesouraria/baseline-longtasks.json'), 'utf8'),
		) as LongTaskSample[];
		const counterpart = await e2e.createParticipant('dashboard-performance');
		await e2e.createLancamento(createEntrySeed(e2e.token, 'dashboard-performance', counterpart.id));

		const finalBundle = await measureTreasuryBundle();
		const finalSamples = await captureLongTaskSamples(browser, (page) => e2e.authenticate(page, 'tesouraria'));
		const chartAutoFiles = await readChartAutoFiles(finalBundle);
		const comparisons = compareLongTaskSamples(baselineLongTasks, finalSamples);
		await writeFinalPerformanceReport({
			environment: captureClientEnvironment(browser.version()),
			baselineBundle,
			finalBundle,
			chartAutoFiles,
			longTasks: comparisons,
		});

		expect(finalSamples).toHaveLength(5);
		expect(baselineLongTasks).toHaveLength(5);
		expect(finalBundle.gzipBytes - baselineBundle.gzipBytes).toBeLessThanOrEqual(102_400);
		expect(chartAutoFiles).toEqual([]);
		expect(comparisons.every(({ newOverThreshold }) => newOverThreshold === 0)).toBe(true);
	});
});
