import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';
import { signIn } from './cadastros-browser';
import { closeDatabase, createTestUsers, deleteTestUsers, type TestUsers } from './cadastros-database';
import {
	createName,
	createParticipant,
	deleteParticipants,
	getPdfPageCount,
	setAmigoFraterno,
} from './amigo-fraterno-support';

const token = randomUUID().slice(0, 8);
const names: string[] = [];
let users: TestUsers | undefined;

const createEligibleParticipants = async (count: number) => {
	const ids = await Promise.all(
		Array.from({ length: count }, async (_, index) => {
			const name = createName(`pdf-${index}`);
			names.push(name);
			const id = await createParticipant(name, index === 0);
			await setAmigoFraterno(id, true);
			return id;
		}),
	);
	return ids;
};

test.describe.serial('Amigo Fraterno PDF', () => {
	test.beforeAll(async () => {
		users = await createTestUsers(token);
	});

	test.afterAll(async () => {
		await deleteParticipants(names);
		if (users) await deleteTestUsers(users);
		await closeDatabase();
	});

	test('E2E-03 downloads a paginated PDF with and without a photo', async ({ page }) => {
		const ids = await createEligibleParticipants(7);
		if (!users) throw new Error('Usuários E2E não foram preparados.');
		await signIn(page, users.owner.email, users.owner.password, '**/sistemas');
		await page.goto('/secretaria/amigofraterno');
		const downloadPromise = page.waitForEvent('download');
		await page.getByRole('link', { name: 'Baixar cartões em PDF' }).click();
		const download = await downloadPromise;
		const stream = await download.createReadStream();
		if (!stream) throw new Error('Download do PDF não foi iniciado.');
		const chunks: Buffer[] = [];
		for await (const chunk of stream) chunks.push(chunk);
		expect(await getPdfPageCount(Buffer.concat(chunks))).toBe(2);
		await Promise.all(ids.map((id) => setAmigoFraterno(id, false)));
	});

	test('E2E-04 disables an empty download and rejects a concurrent empty list', async ({ page }) => {
		const [id] = await createEligibleParticipants(1);
		if (!id || !users) throw new Error('Fixture E2E não foi preparada.');
		await signIn(page, users.owner.email, users.owner.password, '**/sistemas');
		await page.goto('/secretaria/amigofraterno');
		await setAmigoFraterno(id, false);
		const response = await page.request.get('/secretaria/amigofraterno/pdf');
		expect(response.status()).toBe(409);
		await expect(page.getByRole('link', { name: 'Baixar cartões em PDF' })).toBeVisible();
		await page.reload();
		await expect(
			page.getByText('Não há participantes elegíveis no momento. Revise os Cadastros para atualizar a lista.'),
		).toBeVisible();
	});
});
