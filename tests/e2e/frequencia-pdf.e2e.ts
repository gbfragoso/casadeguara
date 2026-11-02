import { expect, test } from './fixtures';
import {
	endDateInput,
	fillAttendanceRequest,
	generatePdfButton,
	openAttendancePage,
	openPdfLink,
	pdfStatus,
	readyStatus,
	seedAttendanceWorkers,
	startDateInput,
	titleInput,
	weekdaysGroup,
} from './frequencia-support';
import { auditWcagViolations } from './support/accessibility';
import { PDF_BLOB, readPdfBlobHead } from './support/pdf-blob';

const COLOR_SCHEMES = ['light', 'dark'] as const;
const NOVEMBER_REQUEST = { title: 'Lista de presença', start: '2026-11-01', end: '2026-11-30' };
const ATTENDANCE_PDF_ROUTE = '**/secretaria/frequencia/pdf?*';
const REMOVED_REGISTRATION_PATH = '/secretaria/frequencia/registro';

test('E2E-01 gera a lista de frequência e abre o PDF em nova aba sem perder o formulário', async ({ page, e2e }) => {
	await seedAttendanceWorkers(e2e, 1);
	await openAttendancePage(page, e2e);
	await fillAttendanceRequest(page, NOVEMBER_REQUEST);
	let releaseResponse: () => void = () => undefined;
	const responseHeld = new Promise<void>((resolve) => (releaseResponse = resolve));
	await page.route(ATTENDANCE_PDF_ROUTE, async (route) => {
		await responseHeld;
		await route.continue();
	});

	await generatePdfButton(page).click();
	await expect(pdfStatus(page)).toHaveText('Gerando o PDF…');
	releaseResponse();
	await expect(readyStatus(page)).toBeVisible();
	await Promise.all([page.waitForEvent('popup'), openPdfLink(page).click()]);

	const href = await openPdfLink(page).getAttribute('href');
	expect(await readPdfBlobHead(page, href ?? '')).toEqual(PDF_BLOB);
	await expect(titleInput(page)).toHaveValue(NOVEMBER_REQUEST.title);
	await expect(endDateInput(page)).toHaveValue(NOVEMBER_REQUEST.end);
	await titleInput(page).fill('Outra lista');
	await expect(openPdfLink(page)).toHaveCount(0);
});

test('E2E-02 mostra as mensagens de validação ligadas aos campos', async ({ page, e2e }) => {
	await openAttendancePage(page, e2e);
	await startDateInput(page).fill('2026-11-01');
	await endDateInput(page).fill('2026-12-31');

	await generatePdfButton(page).click();

	await expect(titleInput(page)).toBeFocused();
	await expect(titleInput(page)).toHaveAccessibleDescription('Informe o título da lista (até 60 caracteres).');
	await expect(weekdaysGroup(page)).toHaveAccessibleDescription(
		'O período gera 27 datas; o limite é 15 por lista. Reduza o período ou os dias da semana.',
	);
	await expect(pdfStatus(page)).toHaveCount(0);
});

for (const scheme of COLOR_SCHEMES) {
	test(`E2E-02 não tem violações WCAG com as mensagens no tema ${scheme}`, async ({ page, e2e }) => {
		await page.emulateMedia({ colorScheme: scheme });
		await openAttendancePage(page, e2e);
		await generatePdfButton(page).click();
		await expect(titleInput(page)).toBeFocused();

		const violations = await auditWcagViolations(page);

		expect(violations).toEqual([]);
	});
}

test('E2E-03 responde 404 no antigo registro de frequências', async ({ page, e2e }) => {
	await e2e.authenticate(page, 'fullAdmin');

	const response = await page.goto(REMOVED_REGISTRATION_PATH);

	expect(response?.status()).toBe(404);
});
