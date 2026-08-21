import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';
import { signIn } from './cadastros-browser';
import { createTestUsers, deleteTestUsers, type TestUsers } from './cadastros-database';
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
	});

	test('E2E-03 downloads a paginated PDF with and without a photo', async ({ page }) => {
		const ids = await createEligibleParticipants(7);
		if (!users) throw new Error('Usuários E2E não foram preparados.');
		await signIn(page, users.owner.email, users.owner.password, '**/sistemas');
		await page.goto('/secretaria/amigofraterno');
		const downloadPromise = page.waitForEvent('download');
		await page.getByLabel('Data do próximo sorteio').fill('2026-11-22');
		await page.getByRole('button', { name: 'Baixar cartões em PDF' }).click();
		const download = await downloadPromise;
		const stream = await download.createReadStream();
		if (!stream) throw new Error('Download do PDF não foi iniciado.');
		const chunks: Buffer[] = [];
		for await (const chunk of stream) chunks.push(chunk);
		expect(await getPdfPageCount(Buffer.concat(chunks))).toBe(2);
		await Promise.all(ids.map((id) => setAmigoFraterno(id, false)));
	});

	test('E2E-07 requires a valid draw date before generating the PDF', async ({ page }) => {
		const ids = await createEligibleParticipants(1);
		if (!users) throw new Error('Usuários E2E não foram preparados.');
		await signIn(page, users.owner.email, users.owner.password, '**/sistemas');
		await page.goto('/secretaria/amigofraterno');
		await expect(page.getByLabel('Data do próximo sorteio')).toHaveAttribute('required', '');
		const invalidDate = await page.request.get('/secretaria/amigofraterno/pdf?nextDrawDate=2026-02-29');
		expect(invalidDate.status()).toBe(400);
		await Promise.all(ids.map((id) => setAmigoFraterno(id, false)));
	});
});
