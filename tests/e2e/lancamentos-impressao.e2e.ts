import { expect, test } from './fixtures';
import { findLancamentoRow, openLancamentosPage, searchLancamentosByDescription } from './lancamentos-browser';
import { createEntrySeed } from './lancamentos-fixture';
import { findPrintBackgroundViolations } from './support/computed-colors';
import { shellRegions } from './support/module-shell';

test.describe('impressão dos lançamentos', () => {
	test('E2E-16 oculta navegação, formulário e ações e remove fundos ao imprimir a consulta', async ({
		page,
		e2e,
	}) => {
		const counterpart = await e2e.createParticipant('impressao');
		const entry = await e2e.createLancamento(createEntrySeed(e2e.token, 'impressao', counterpart.id));
		await e2e.authenticate(page, 'admin');
		await openLancamentosPage(page);
		await searchLancamentosByDescription(page, entry.descricao);
		const row = findLancamentoRow(page, entry.descricao);

		await page.emulateMedia({ media: 'print' });

		const { sidebar, topbar } = shellRegions(page);
		for (const region of [sidebar, topbar, page.getByRole('navigation', { name: 'Trilha de navegação' })]) {
			await expect(region).toBeHidden();
		}
		await expect(page.locator('form').first()).toBeHidden();
		await expect(page.getByRole('columnheader', { name: 'Ações' })).toBeHidden();
		await expect(row.getByRole('link', { name: 'Estornar' })).toBeHidden();
		await expect(row.getByRole('link', { name: 'Recibo' })).toBeHidden();
		await expect(page.getByRole('cell', { name: entry.descricao })).toBeVisible();
		await expect(page.getByText('Total de entradas:')).toBeVisible();
		expect(await findPrintBackgroundViolations(page)).toEqual([]);
	});
});
