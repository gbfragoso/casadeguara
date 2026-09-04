import { test, expect, waitForHydration } from './fixtures';

import {
	fillLancamentoForm,
	findLancamentoRow,
	openLancamentoForm,
	openLancamentosPage,
	reverseFromRow,
	searchLancamentosByDescription,
	submitAuditSearch,
	submitLancamentosSearch,
} from './lancamentos-browser';
import { createEntrySeed, createExitPageSeeds, createExitSeed } from './lancamentos-fixture';
import { insertReversals } from './lancamentos-database';

const removedTreasuryPaths = [
	'/tesouraria/entradas',
	'/tesouraria/entradas/novo',
	'/tesouraria/entradas/1',
	'/tesouraria/entradas/1/estorno',
	'/tesouraria/saidas',
	'/tesouraria/saidas/novo',
	'/tesouraria/saidas/1',
	'/tesouraria/historico',
];

test('E2E-01 consulta lançamentos, filtros, totais e teclado', async ({ page, e2e }) => {
	const counterpart = await e2e.createParticipant('consulta');
	const entry = createEntrySeed(e2e.token, 'filtro', counterpart.id, { valor: '150.00' });
	await e2e.createLancamento(entry);
	await e2e.createLancamentos(createExitPageSeeds(e2e.token, 101));
	await e2e.authenticate(page, 'tesouraria');
	await openLancamentosPage(page);
	await searchLancamentosByDescription(page, e2e.token);

	await expect(page.locator('tbody tr')).toHaveCount(100);
	await expect(page.locator('body')).toContainText('R$ 150,00');
	await page.getByLabel('Tipo de lançamento').selectOption('entrada');
	await expect(page.getByLabel('Tipo de lançamento')).toHaveValue('entrada');
	await page.getByLabel('Descrição').focus();
	await page.keyboard.press('Tab');
	await expect(page.getByLabel('Registrado em')).toBeFocused();
	await expect((await submitLancamentosSearch(page)).ok()).toBe(true);
	await page.goto(`/tesouraria/lancamentos?tipo=entrada&descricao=${encodeURIComponent(e2e.token)}`);
	await waitForHydration(page);
	await expect(page.locator('tbody tr')).toHaveCount(1);
	await expect(page.locator('tbody tr')).toContainText('Entrada');

	await page.getByLabel('Tipo de lançamento').selectOption('saida');
	await expect((await submitLancamentosSearch(page)).ok()).toBe(true);
	await page.goto(`/tesouraria/lancamentos?tipo=saida&descricao=${encodeURIComponent(e2e.token)}`);
	await waitForHydration(page);
	await expect(page.locator('tbody tr')).toHaveCount(100);
	await expect(page.getByRole('link', { name: 'Próxima página' })).toHaveCount(0);
});

test('E2E-09 limita a consulta e pesquisa contraparte por prefixo sem acento', async ({ page, e2e }) => {
	const counterpart = await e2e.createParticipant('Árvore');
	await e2e.createLancamentos(
		Array.from({ length: 101 }, (_, index) =>
			createEntrySeed(e2e.token, `limite-${index}`, counterpart.id, { dataLancamento: '2026-09-02' }),
		),
	);
	await e2e.authenticate(page, 'tesouraria');
	await openLancamentosPage(page);

	const prefix = counterpart.name.replace('Á', 'a').toLowerCase();
	await page.getByLabel('Contraparte').fill(prefix);
	const response = await submitLancamentosSearch(page);

	expect(response.ok()).toBe(true);
	await expect(page.locator('tbody tr')).toHaveCount(100);
	await expect(page.getByRole('link', { name: 'Próxima página' })).toHaveCount(0);
	await expect(page.locator('body')).toContainText('Total de entradas:');
});

test('E2E-10 comunica carregamento e limpa o estado após sucesso e erro', async ({ page, e2e }) => {
	await e2e.authenticate(page, 'tesouraria');
	await openLancamentosPage(page);

	let release: (() => void) | undefined;
	const pending = new Promise<void>((resolve) => {
		release = resolve;
	});
	await page.route('**/tesouraria/lancamentos*', async (route) => {
		await pending;
		await route.continue();
	});
	const successResponse = submitLancamentosSearch(page);
	await page.waitForRequest(
		(request) => request.method() === 'POST' && request.url().includes('/tesouraria/lancamentos'),
	);
	const button = page.getByRole('button', { name: 'Pesquisar' });
	await expect(button).toHaveClass(/is-loading/);
	await expect(button).toHaveAttribute('aria-busy', 'true');
	release?.();
	await expect((await successResponse).ok()).toBe(true);
	await expect(button).not.toHaveClass(/is-loading/);
	await expect(button).toHaveAttribute('aria-busy', 'false');

	await page.locator('form.card').evaluate((form) => {
		const tipo = document.createElement('input');
		tipo.type = 'hidden';
		tipo.name = 'tipo';
		tipo.value = 'invalido';
		form.append(tipo);
	});
	const failedResponse = submitLancamentosSearch(page);
	await page.waitForRequest(
		(request) => request.method() === 'POST' && request.url().includes('/tesouraria/lancamentos'),
	);
	await expect(button).toHaveClass(/is-loading/);
	await expect(button).toHaveAttribute('aria-busy', 'true');
	await failedResponse;
	await expect(button).not.toHaveClass(/is-loading/);
	await expect(button).toHaveAttribute('aria-busy', 'false');
});

test('E2E-02 valida entrada com foco na contraparte e abre recibo numerado', async ({ page, e2e }) => {
	const counterpart = await e2e.createParticipant('recibo');
	const seed = createEntrySeed(e2e.token, 'cadastro', counterpart.id);
	await e2e.authenticate(page, 'tesouraria');
	await openLancamentoForm(page);
	await fillLancamentoForm(page, {
		tipo: 'entrada',
		descricao: seed.descricao,
		valor: seed.valor,
		dataLancamento: seed.dataLancamento,
	});
	await page.getByRole('button', { name: 'Cadastrar' }).click();
	await expect(page.getByLabel('Doador (obrigatório)')).toBeFocused();

	await page.getByLabel('Doador (obrigatório)').selectOption(`${counterpart.id}`);
	await Promise.all([
		page.waitForURL(/\/recibo\/[0-9a-f-]+$/),
		page.getByRole('button', { name: 'Cadastrar' }).click(),
	]);
	const created = await e2e.readLancamentoByDescription(seed.descricao);
	await expect(page.locator('#recibo')).toBeVisible();
	await expect(page.locator('#recibo')).toContainText(seed.descricao.toUpperCase());
	await expect(page.locator('#recibo')).toContainText(`${created.id}`);
});

test('E2E-03 cadastra saída sem contraparte, recibo ou ação de recibo', async ({ page, e2e }) => {
	const seed = createExitSeed(e2e.token, 'sem-recibo');
	await e2e.authenticate(page, 'tesouraria');
	await openLancamentoForm(page);
	await fillLancamentoForm(page, {
		tipo: 'saida',
		descricao: seed.descricao,
		valor: seed.valor,
		dataLancamento: seed.dataLancamento,
	});
	await expect(page.getByLabel('Favorecido (opcional)')).not.toHaveAttribute('required');
	await expect(page.locator('#depositado')).toHaveCount(0);
	await Promise.all([
		page.waitForURL(/\/tesouraria\/lancamentos\?criado=\d+$/),
		page.getByRole('button', { name: 'Cadastrar' }).click(),
	]);
	await expect(page.getByLabel('Descrição')).toBeVisible();
	await searchLancamentosByDescription(page, seed.descricao);
	const row = findLancamentoRow(page, seed.descricao);
	await expect(row).toBeVisible();
	await expect(row.getByRole('link', { name: 'Recibo' })).toHaveCount(0);
});

test('E2E-04 administrador estorna entrada e saída e audita ambas', async ({ page, e2e }) => {
	const counterpart = await e2e.createParticipant('estorno');
	const entry = await e2e.createLancamento(createEntrySeed(e2e.token, 'estorno-entrada', counterpart.id));
	const exit = await e2e.createLancamento(createExitSeed(e2e.token, 'estorno-saida'));
	await e2e.authenticate(page, 'admin');
	await openLancamentosPage(page);
	await searchLancamentosByDescription(page, entry.descricao);
	await reverseFromRow(page, findLancamentoRow(page, entry.descricao), 'Motivo entrada E2E');
	await openLancamentosPage(page);
	await page.goto(`/tesouraria/lancamentos?descricao=${encodeURIComponent(exit.descricao)}`);
	await waitForHydration(page);
	await expect(findLancamentoRow(page, exit.descricao)).toBeVisible();
	await reverseFromRow(page, findLancamentoRow(page, exit.descricao), 'Motivo saída E2E');
	await openLancamentosPage(page);
	await page.goto(`/tesouraria/lancamentos?descricao=${encodeURIComponent(e2e.token)}`);
	await waitForHydration(page);
	await expect(findLancamentoRow(page, entry.descricao)).toHaveCount(0);
	await expect(findLancamentoRow(page, exit.descricao)).toHaveCount(0);

	await page.goto('/tesouraria/estornos');
	await waitForHydration(page);
	const auditForm = page.locator('form.card');
	await auditForm.getByLabel('Descrição').fill(entry.descricao);
	await expect((await submitAuditSearch(page)).ok()).toBe(true);
	await expect(findLancamentoRow(page, entry.descricao)).toContainText('Motivo entrada E2E');
	await page.goto(`/tesouraria/estornos?descricao=${encodeURIComponent(exit.descricao)}`);
	await waitForHydration(page);
	await expect(findLancamentoRow(page, exit.descricao)).toContainText('Motivo saída E2E');
	await expect(e2e.readReversal(entry.id)).resolves.toMatchObject({ userEstorno: e2e.users.admin.id });
});

test('E2E-05 permite estorno a usuário regular e mantém auditoria administrativa', async ({ page, e2e }) => {
	const counterpart = await e2e.createParticipant('permissao');
	const entry = await e2e.createLancamento(createEntrySeed(e2e.token, 'protegida', counterpart.id));
	await e2e.authenticate(page, 'tesouraria');
	await openLancamentosPage(page);
	await searchLancamentosByDescription(page, entry.descricao);
	await expect(findLancamentoRow(page, entry.descricao).getByRole('link', { name: 'Estornar' })).toBeVisible();
	await reverseFromRow(page, findLancamentoRow(page, entry.descricao), 'Motivo usuário regular E2E');
	await expect(e2e.readReversal(entry.id)).resolves.toMatchObject({ userEstorno: e2e.users.tesouraria.id });

	const auditResponse = await page.goto('/tesouraria/estornos');
	await expect(auditResponse?.status()).toBe(403);
});

test('E2E-06 invalida recibo compartilhado depois do estorno', async ({ page, e2e }) => {
	const counterpart = await e2e.createParticipant('recibo-estornado');
	const entry = await e2e.createLancamento(createEntrySeed(e2e.token, 'recibo-publico', counterpart.id));
	await e2e.authenticate(page, 'admin');
	await openLancamentosPage(page);
	await searchLancamentosByDescription(page, entry.descricao);
	await reverseFromRow(page, findLancamentoRow(page, entry.descricao), 'Recibo cancelado E2E');

	await page.goto(`/recibo/${entry.uuidRecibo}`);
	await expect(page.locator('#recibo-estornado')).toBeVisible();
	await expect(page.locator('#recibo-estornado')).toContainText('Recibo cancelado E2E');
	await expect(page.locator('#recibo')).toHaveCount(0);
	await expect(page.locator('body')).not.toContainText(entry.descricao);
	await expect(page.locator('body')).not.toContainText(entry.valor);
});

test('E2E-07 baixa no Caixa altera depósito e exclui estornados das visões', async ({ page, e2e }) => {
	const counterpart = await e2e.createParticipant('caixa');
	const pending = await e2e.createLancamento(
		createEntrySeed(e2e.token, 'caixa-pendente', counterpart.id, { valor: '30.00' }),
	);
	const deposited = await e2e.createLancamento(
		createEntrySeed(e2e.token, 'caixa-depositada', counterpart.id, { valor: '20.00', depositado: true }),
	);
	const reversed = await e2e.createLancamento(
		createEntrySeed(e2e.token, 'caixa-estornada', counterpart.id, { valor: '40.00' }),
	);
	await e2e.createLancamento(createExitSeed(e2e.token, 'caixa-saida', { valor: '10.00' }));
	await e2e.authenticate(page, 'admin');
	await openLancamentosPage(page);
	await searchLancamentosByDescription(page, reversed.descricao);
	await reverseFromRow(page, findLancamentoRow(page, reversed.descricao), 'Caixa estornada E2E');
	await page.goto('/tesouraria/caixa');
	await waitForHydration(page);
	const pendingRow = page.locator('tbody tr').filter({ hasText: pending.descricao.toUpperCase() });
	await expect(pendingRow).toBeVisible();
	await expect(page.locator('tbody tr').filter({ hasText: deposited.descricao.toUpperCase() })).toHaveCount(0);
	await expect(page.locator('body')).not.toContainText(reversed.descricao.toUpperCase());

	await pendingRow.locator('input[type="checkbox"]').check();
	await page.getByRole('button', { name: 'Confirmar depósito' }).click();
	await expect(pendingRow).toHaveCount(0);
	await expect(e2e.readLancamento(pending.id)).resolves.toMatchObject({ depositado: true });
	await expect(e2e.readLancamento(deposited.id)).resolves.toMatchObject({ depositado: true });

	await page.goto('/tesouraria');
	await waitForHydration(page);
	const donationsSummary = page.locator('.box').filter({ hasText: 'Total de doações' });
	await expect(donationsSummary).toContainText(/Total de doações\s+\d+/);
	expect(Number((await donationsSummary.innerText()).match(/(\d+)\s*$/)?.[1])).toBeGreaterThanOrEqual(2);
	await expect(page.locator('.box').filter({ hasText: 'Valor recebido' })).toContainText(/R\$\s*[\d.]+,\d{2}/);
	await expect(page.locator('.box').filter({ hasText: 'Despesas' })).toContainText(/R\$\s*[\d.]+,\d{2}/);
	await expect(e2e.readReversal(reversed.id)).resolves.toMatchObject({ motivo: 'Caixa estornada E2E' });
});

test('E2E-11 consulta estornos por contraparte textual, limite e datas civis', async ({ page, e2e }) => {
	const counterpart = await e2e.createParticipant('Árvore');
	const entries = await e2e.createLancamentos(
		Array.from({ length: 101 }, (_, index) =>
			createEntrySeed(e2e.token, `auditoria-${index}`, counterpart.id, { dataLancamento: '2026-09-01' }),
		),
	);
	await insertReversals(
		e2e.database,
		entries.map(({ id }) => id),
		'Motivo auditoria E2E',
	);
	await e2e.authenticate(page, 'admin');
	await page.goto('/tesouraria/estornos');
	await waitForHydration(page);

	const prefix = counterpart.name
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toUpperCase();
	await page.getByLabel('Contraparte').fill(prefix);
	const response = await submitAuditSearch(page);

	expect(response.ok()).toBe(true);
	await expect(page.locator('tbody tr')).toHaveCount(100);
	await expect(page.getByRole('link', { name: 'Próxima página' })).toHaveCount(0);
	await expect(page.locator('tbody tr').first()).toContainText('01/09/2026');
	await expect(page.locator('tbody tr').first()).toContainText('02/09/2026');
});

test('E2E-08 removes legacy treasury navigation and URLs', async ({ page, e2e }) => {
	await e2e.authenticate(page);
	await page.goto('/tesouraria');
	await waitForHydration(page);

	await expect(page.getByRole('link', { name: 'Lançamentos' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Entradas' })).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Saídas' })).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Histórico' })).toHaveCount(0);

	for (const path of removedTreasuryPaths) {
		const response = await page.goto(path);
		expect(response?.status()).toBe(404);
		expect(new URL(page.url()).pathname).toBe(path);
	}
});
