import { randomUUID } from 'node:crypto';

import { test } from '@playwright/test';
import { signIn } from './cadastros-browser';
import { closeDatabase, createTestUsers, deleteCadastro, deleteTestUsers, type TestUsers } from './cadastros-database';
import { createCadastroFixture } from './cadastros-fixture';
import { assertMissingCadastro, assertUnauthorizedUpdate, runOwnerJourney } from './cadastros-journey';

const token = randomUUID().replaceAll('-', '').slice(0, 12);
const fixture = createCadastroFixture(token);
let users: TestUsers | undefined;

test.describe('shared cadastro journey', () => {
	test.beforeAll(async () => {
		users = await createTestUsers(token);
	});

	test.afterAll(async () => {
		await deleteCadastro(fixture.name);
		if (users) await deleteTestUsers(users);
		await closeDatabase();
	});

	test('preserves dashboard-owned data and protects personal identifiers', async ({ browser }) => {
		const preparedUsers = users;
		if (!preparedUsers) throw new Error('Usuários E2E não foram preparados.');

		const ownerContext = await browser.newContext();
		const wrongRoleContext = await browser.newContext();

		try {
			const ownerPage = await ownerContext.newPage();
			await signIn(ownerPage, preparedUsers.owner.email, preparedUsers.owner.password, '**/sistemas');
			const journey = await runOwnerJourney(ownerPage, fixture);
			const wrongRolePage = await wrongRoleContext.newPage();
			await assertUnauthorizedUpdate(
				wrongRolePage,
				preparedUsers.wrongRole,
				journey.id,
				journey.beforeInvalidUpdate,
				fixture.name,
			);
			await deleteCadastro(fixture.name);
			await assertMissingCadastro(ownerPage, journey.id);
		} finally {
			await ownerContext.close();
			await wrongRoleContext.close();
		}
	});
});
