import { formatBirthdayListTitle } from '../../src/lib/birthdays/format';
import {
	chooseMonth,
	downloadPdfLink,
	generateListButton,
	generatePdfButton,
	openBirthdaysPage,
	openPdfLink,
	readCurrentMonthOption,
	readFollowingMonthOption,
	readReferenceMonth,
	readyStatus,
	seedBirthdayWorkers,
} from './aniversariantes-support';
import { expect, test } from './fixtures';
import { findPrintBackgroundViolations } from './support/computed-colors';
import { shellRegions } from './support/module-shell';

const SEEDED_WORKERS = 1;

const birthdayOption = readFollowingMonthOption(readCurrentMonthOption());
const birthdayMonth = readReferenceMonth(birthdayOption);

test.describe('relatório de aniversariantes', () => {
	test('E2E-16 oculta controles e resultado do PDF e remove fundos ao imprimir a lista', async ({ page, e2e }) => {
		const [participant] = await seedBirthdayWorkers(e2e, birthdayOption, SEEDED_WORKERS);
		await openBirthdaysPage(page, e2e);
		await chooseMonth(page, birthdayOption);
		await generateListButton(page).click();
		const birthdayCell = page.getByRole('cell', { name: participant.name.toUpperCase(), exact: true });
		await expect(birthdayCell).toBeVisible();
		const title = formatBirthdayListTitle(birthdayOption, birthdayMonth.year);
		await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
		await generatePdfButton(page).click();
		await expect(readyStatus(page, birthdayMonth)).toBeVisible();

		await page.emulateMedia({ media: 'print' });

		const { sidebar, topbar } = shellRegions(page);
		for (const region of [sidebar, topbar, page.getByRole('navigation', { name: 'Trilha de navegação' })]) {
			await expect(region).toBeHidden();
		}
		await expect(page.getByRole('heading', { name: 'Lista de aniversariantes' })).toBeHidden();
		await expect(page.locator('form').filter({ has: page.getByRole('combobox') })).toBeHidden();
		for (const control of [generateListButton(page), generatePdfButton(page)]) {
			await expect(control).toBeHidden();
		}
		for (const pdfArea of [readyStatus(page, birthdayMonth), openPdfLink(page), downloadPdfLink(page)]) {
			await expect(pdfArea).toBeHidden();
		}
		await expect(birthdayCell).toBeVisible();
		expect(await findPrintBackgroundViolations(page)).toEqual([]);
	});
});
