import { test, expect } from './fixtures';

import { assertPrivateCadastroViews, createBibliotecaCadastro } from './cadastros-browser';
import { assertUnauthorizedUpdate } from './cadastros-journey';
import { seedCadastro } from './cadastros-seed';
import {
	updateBibliotecaCadastro,
	updateSecretariaCadastro,
	updateSecretariaFlags,
	updateTesourariaCadastro,
} from './cadastros-updates';

test('E2E-17 secretaria preserves library and treasury data', async ({ page, e2e }) => {
	const fixture = e2e.createCadastro();
	await e2e.authenticate(page);
	await seedCadastro(e2e.database, fixture);
	const created = await e2e.readCadastro(fixture.name);
	await updateSecretariaCadastro(page, created.idleitor, fixture);
	await updateSecretariaFlags(page, fixture.name);
	const updated = await e2e.readCadastro(fixture.name);
	expect(updated).toMatchObject({
		celular: created.celular,
		telefone: created.telefone,
		cpf: created.cpf,
		rg: created.rg,
		status: created.status,
	});
});

test('E2E-18 biblioteca preserves secretaria and treasury data', async ({ page, e2e }) => {
	const fixture = e2e.createCadastro();
	await e2e.authenticate(page);
	await seedCadastro(e2e.database, fixture);
	const created = await e2e.readCadastro(fixture.name);
	await updateBibliotecaCadastro(page, created.idleitor, fixture);
	const updated = await e2e.readCadastro(fixture.name);
	expect(updated).toMatchObject({
		email: created.email,
		telefone: created.telefone,
		aniversario: created.aniversario,
		frequencia: created.frequencia,
		desencarnado: created.desencarnado,
	});
});

test('E2E-19 tesouraria preserves secretaria and library data', async ({ page, e2e }) => {
	const fixture = e2e.createCadastro();
	await e2e.authenticate(page);
	await seedCadastro(e2e.database, fixture);
	const created = await e2e.readCadastro(fixture.name);
	await updateTesourariaCadastro(page, created.idleitor, fixture);
	const updated = await e2e.readCadastro(fixture.name);
	expect(updated).toMatchObject({
		email: created.email,
		celular: created.celular,
		logradouro: created.logradouro,
		status: created.status,
	});
});

test('E2E-20 protects personal identifiers between roles', async ({ browser, page, e2e }) => {
	const fixture = e2e.createCadastro();
	await e2e.authenticate(page);
	await seedCadastro(e2e.database, fixture);
	const created = await e2e.readCadastro(fixture.name);
	await assertPrivateCadastroViews(page, created.idleitor, fixture);
	const wrongRoleContext = await browser.newContext();
	try {
		await assertUnauthorizedUpdate(
			await wrongRoleContext.newPage(),
			e2e.database,
			e2e.users.wrongRole,
			created.idleitor,
			created,
			fixture.name,
		);
	} finally {
		await wrongRoleContext.close();
	}
});

test('E2E-21 creates a cadastro above the previous identifier limit', async ({ page, e2e }) => {
	const fixture = e2e.createCadastro();
	await e2e.authenticate(page);
	try {
		await createBibliotecaCadastro(page, fixture, () => e2e.advanceCadastroSequence(32767));
	} finally {
		await e2e.restoreCadastroSequence();
	}
	const created = await e2e.readCadastro(fixture.name);
	expect(created.idleitor).toBeGreaterThan(32767);
});
