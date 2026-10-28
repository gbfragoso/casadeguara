import type { Page } from '@playwright/test';

import { expect, test, waitForHydration, type E2EData } from './fixtures';
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
import { auditWcagViolations } from './support/accessibility';
import { PDF_BLOB, readPdfBlobHead } from './support/pdf-blob';

const COLOR_SCHEMES = ['light', 'dark'] as const;
const SEEDED_TALKS = 2;
const HISTORY_PATH = '/comunicacao/palestras?visao=historico';

const [, nextMonth] = readProgramMonths();

const openPreparedDialog = async (page: Page, e2e: E2EData) => {
	await e2e.authenticate(page, 'comunicacao');
	await openBoard(page);
	await programAction(page).click();
	await expectOfferedMonths(page, readProgramMonths());
	await seedCompleteMonth(e2e, nextMonth, SEEDED_TALKS);
};

const openHistoryByKeyboard = async (page: Page, e2e: E2EData) => {
	await e2e.authenticate(page, 'comunicacao');
	await page.goto(HISTORY_PATH);
	await waitForHydration(page);
	await programAction(page).focus();
	await page.keyboard.press('Enter');
	await expect(programDialog(page)).toBeFocused();
};

const chooseNextMonthByKeyboard = async (page: Page, e2e: E2EData) => {
	await openHistoryByKeyboard(page, e2e);
	await expectOfferedMonths(page, readProgramMonths());
	await seedCompleteMonth(e2e, nextMonth, SEEDED_TALKS);
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await expect(monthOption(page, nextMonth)).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(readyStatus(page, nextMonth)).toBeVisible();
};

test('E2E-01 abre a programação do mês seguinte em três interações', async ({ page, e2e }) => {
	await openPreparedDialog(page, e2e);
	await monthOption(page, nextMonth).click();

	const openLink = programDialog(page).getByRole('link', { name: 'Abrir para imprimir' });
	await Promise.all([page.waitForEvent('popup'), openLink.click()]);

	const href = await openLink.getAttribute('href');
	expect(href).toMatch(/^blob:/);
	expect(await readPdfBlobHead(page, href ?? '')).toEqual(PDF_BLOB);
});

test('E2E-01 baixa a programação com o nome do mês', async ({ page, e2e }) => {
	await openPreparedDialog(page, e2e);
	await monthOption(page, nextMonth).click();
	await expect(readyStatus(page, nextMonth)).toBeVisible();

	const [download] = await Promise.all([
		page.waitForEvent('download'),
		programDialog(page).getByRole('link', { name: 'Baixar' }).click(),
	]);

	expect(download.suggestedFilename()).toBe(`programacao-palestras-${nextMonth.key}.pdf`);
});

test('E2E-02 escolhe o mês pelo teclado a partir do Histórico', async ({ page, e2e }) => {
	await chooseNextMonthByKeyboard(page, e2e);

	await expect(monthOption(page, nextMonth)).toHaveAttribute('aria-pressed', 'true');
});

test('E2E-02 fecha com Escape e reabre no estado inicial', async ({ page, e2e }) => {
	await chooseNextMonthByKeyboard(page, e2e);

	await page.keyboard.press('Escape');

	await expect(programDialog(page)).toBeHidden();
	await expect(programAction(page)).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(programDialog(page).getByRole('button', { pressed: true })).toHaveCount(0);
	await expect(programDialog(page).getByRole('status')).toHaveCount(0);
});

for (const scheme of COLOR_SCHEMES) {
	test(`E2E-02 não tem violações do axe com a programação pronta no tema ${scheme}`, async ({ page, e2e }) => {
		await page.emulateMedia({ colorScheme: scheme });
		await chooseNextMonthByKeyboard(page, e2e);

		const violations = await auditWcagViolations(page);

		expect(violations).toEqual([]);
	});
}
