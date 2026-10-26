import { test, expect } from './fixtures';

import { findLancamentoRow, openLancamentosPage, searchLancamentosByDescription } from './lancamentos-browser';
import { createEntrySeed, createExitSeed } from './lancamentos-fixture';

test('E2E-01 corrige a descrição na linha sem perder a pesquisa', async ({ page, e2e }) => {
	const counterpart = await e2e.createParticipant('descricao');
	const entry = await e2e.createLancamento(createEntrySeed(e2e.token, 'corrigir', counterpart.id));
	const exit = createExitSeed(e2e.token, 'mantida');
	await e2e.createLancamento(exit);
	const corrected = `E2E ${e2e.token} entrada corrigida`;
	await e2e.authenticate(page, 'tesouraria');
	await openLancamentosPage(page);
	await searchLancamentosByDescription(page, e2e.token);

	const editButton = page.getByRole('button', { name: `Editar descrição do lançamento ${entry.id}` });
	const row = page.locator('tbody tr').filter({ has: editButton });
	await editButton.click();
	await row.getByRole('textbox', { name: `Descrição do lançamento ${entry.id}` }).fill(corrected);
	await row.getByRole('button', { name: 'Salvar descrição' }).click();

	await expect(page.getByRole('status')).toContainText(`Descrição do lançamento ${entry.id} atualizada.`);
	await expect(findLancamentoRow(page, corrected)).toHaveCount(1);
	await expect(findLancamentoRow(page, exit.descricao)).toHaveCount(1);
	const [saved] = await e2e.database<{ descricao: string; userAlteracao: string | null }[]>`
		select descricao, user_alteracao as "userAlteracao" from lancamentos where idlancamento = ${entry.id}
	`;
	expect(saved).toEqual({ descricao: corrected, userAlteracao: e2e.users.tesouraria.id });
});
