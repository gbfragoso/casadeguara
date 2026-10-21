import { expect, test } from './fixtures';
import { findPrintBackgroundViolations } from './support/computed-colors';
import { openModulePage, shellRegions } from './support/module-shell';

const BIRTHDAY = '1990-01-15';

test.describe('relatório de aniversariantes', () => {
	test('E2E-16 oculta navegação, formulário e ações e remove fundos ao imprimir a lista', async ({ page, e2e }) => {
		const participant = await e2e.createParticipant('aniversario');
		await e2e.database`update cadastros set aniversario = ${BIRTHDAY} where idleitor = ${participant.id}`;
		await openModulePage(page, e2e, '/secretaria/aniversariantes');
		await page.getByRole('button', { name: 'Gerar lista' }).click();
		const birthdayCell = page.getByRole('cell', { name: participant.name.toUpperCase(), exact: true });
		await expect(birthdayCell).toBeVisible();

		await page.emulateMedia({ media: 'print' });

		const { sidebar, topbar } = shellRegions(page);
		for (const region of [sidebar, topbar, page.getByRole('navigation', { name: 'breadcrumbs' })]) {
			await expect(region).toBeHidden();
		}
		await expect(page.getByRole('heading', { name: 'Lista de aniversariantes' })).toBeHidden();
		await expect(page.locator('form').filter({ has: page.getByRole('combobox') })).toBeHidden();
		await expect(page.getByRole('button', { name: 'Gerar lista' })).toBeHidden();
		await expect(birthdayCell).toBeVisible();
		expect(await findPrintBackgroundViolations(page)).toEqual([]);
	});
});
