import type { Page } from '@playwright/test';

import { buildBirthdayFileName } from '../../src/lib/birthdays/format';
import {
	chooseMonth,
	downloadPdfLink,
	generateListButton,
	generatePdfButton,
	monthSelect,
	openBirthdaysPage,
	openPdfLink,
	pdfStatus,
	readCurrentMonthOption,
	readFollowingMonthOption,
	readReferenceMonth,
	readyStatus,
	seedBirthdayWorkers,
} from './aniversariantes-support';
import { expect, test, type E2EData } from './fixtures';
import { auditWcagViolations } from './support/accessibility';
import { PDF_BLOB, readPdfBlobHead } from './support/pdf-blob';

const COLOR_SCHEMES = ['light', 'dark'] as const;
const SEEDED_WORKERS = 1;

const currentOption = readCurrentMonthOption();
const chosenOption = readFollowingMonthOption(currentOption);
const chosenMonth = readReferenceMonth(chosenOption);

const openSeededPage = async (page: Page, e2e: E2EData) => {
	await seedBirthdayWorkers(e2e, chosenOption, SEEDED_WORKERS);
	await openBirthdaysPage(page, e2e);
};

const generatePdfByKeyboard = async (page: Page, e2e: E2EData) => {
	await openSeededPage(page, e2e);
	await chooseMonth(page, chosenOption);
	await monthSelect(page).focus();
	await page.keyboard.press('Tab');
	await expect(generateListButton(page)).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(generatePdfButton(page)).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(readyStatus(page, chosenMonth)).toBeVisible();
};

test('E2E-01 abre a lista do mês escolhido em três interações', async ({ page, e2e }) => {
	await openSeededPage(page, e2e);
	await chooseMonth(page, chosenOption);
	await generatePdfButton(page).click();

	await Promise.all([page.waitForEvent('popup'), openPdfLink(page).click()]);

	const href = await openPdfLink(page).getAttribute('href');
	expect(href).toMatch(/^blob:/);
	expect(await readPdfBlobHead(page, href ?? '')).toEqual(PDF_BLOB);
});

test('E2E-01 baixa a lista com o ano de referência no nome', async ({ page, e2e }) => {
	await openSeededPage(page, e2e);
	await chooseMonth(page, chosenOption);
	await generatePdfButton(page).click();
	await expect(readyStatus(page, chosenMonth)).toBeVisible();

	const [download] = await Promise.all([page.waitForEvent('download'), downloadPdfLink(page).click()]);

	expect(download.suggestedFilename()).toBe(buildBirthdayFileName(chosenMonth));
});

test('E2E-02 gera o PDF pelo teclado', async ({ page, e2e }) => {
	await generatePdfByKeyboard(page, e2e);

	await expect(openPdfLink(page)).toHaveAttribute('href', /^blob:/);
});

test('E2E-02 remove o resultado ao trocar o mês', async ({ page, e2e }) => {
	await generatePdfByKeyboard(page, e2e);

	await chooseMonth(page, currentOption);

	await expect(pdfStatus(page)).toHaveCount(0);
	await expect(openPdfLink(page)).toHaveCount(0);
});

for (const scheme of COLOR_SCHEMES) {
	test(`E2E-02 não tem violações do axe com o PDF pronto no tema ${scheme}`, async ({ page, e2e }) => {
		await page.emulateMedia({ colorScheme: scheme });
		await generatePdfByKeyboard(page, e2e);

		const violations = await auditWcagViolations(page);

		expect(violations).toEqual([]);
	});
}
