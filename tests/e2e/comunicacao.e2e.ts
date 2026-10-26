import { randomUUID } from 'node:crypto';
import type { Page } from '@playwright/test';

import { signIn } from './cadastros-browser';
import { deleteUserByUsername } from './comunicacao-database';
import { expect, test, waitForHydration, type E2EData } from './fixtures';
import { openBoard, talkCard } from './palestras-browser';
import { shellRegions } from './support/module-shell';

const BOARD_URL = /\/comunicacao\/palestras$/;
const BOARD_DESTINATION = '**/comunicacao/palestras';

type Volunteer = { name: string; username: string; password: string };

const createVolunteer = async (page: Page, volunteer: Volunteer) => {
	await page.goto('/comunicacao/usuarios/novo');
	await waitForHydration(page);
	await page.getByLabel('Usuário', { exact: true }).fill(volunteer.username);
	await page.getByLabel('Senha', { exact: true }).fill(volunteer.password);
	await page.getByLabel('Nome', { exact: true }).fill(volunteer.name);
	await page.getByLabel('Setor', { exact: true }).selectOption('comunicacao');

	await page.getByRole('button', { name: 'Cadastrar' }).click();

	await expect(page.getByText('Usuário cadastrado com sucesso!')).toBeVisible();
};

const seedExclusionTargets = async (e2e: E2EData) => {
	const title = `${e2e.token} exclusões`;
	await e2e.createTalks([{ titulo: title, data: e2e.talkDate(0), horario: '08:45' }]);
	const speakerId = await e2e.createSpeaker({ nome: `Palestrante exclusões ${e2e.token}` });
	return { title, speakerPath: `/comunicacao/palestrantes/${speakerId}` };
};

const readModuleControls = async (page: Page, e2e: E2EData) => {
	const { title, speakerPath } = await seedExclusionTargets(e2e);
	await openBoard(page);
	const usersLink = shellRegions(page).sidebar.getByRole('link', { name: 'usuários' });
	const deleteTalk = talkCard(page, title).getByRole('button', { name: /^Excluir palestra/ });
	await expect(talkCard(page, title)).toBeVisible();
	const board = { users: await usersLink.count(), deleteTalk: await deleteTalk.count() };

	await page.goto(speakerPath);
	await waitForHydration(page);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	const deleteSpeaker = await page.getByRole('button', { name: 'Excluir palestrante' }).count();
	return { ...board, deleteSpeaker };
};

test.describe('entrada no módulo da Comunicação', () => {
	test('E2E-01 leva o voluntário ao board de palestras depois do login', async ({ page, e2e }) => {
		await e2e.authenticate(page, 'comunicacao');

		await expect(page).toHaveURL(BOARD_URL);
		await expect(page.getByRole('heading', { name: 'Palestras', level: 1 })).toBeVisible();
	});

	test('E2E-01 mostra Comunicação na seleção de módulos da coordenação total', async ({ page, e2e }) => {
		await e2e.authenticate(page, 'fullAdmin');

		await page.getByRole('link', { name: 'Comunicação' }).click();

		await expect(page).toHaveURL(BOARD_URL);
	});

	test('E2E-01 cria um voluntário que entra no board e aparece na lista de usuários', async ({
		browser,
		page,
		e2e,
	}) => {
		const volunteer = {
			name: `Voluntário ${e2e.token}`,
			username: `e2e-vol-${e2e.token}@t.dev`,
			password: randomUUID(),
		};
		const volunteerContext = await browser.newContext();
		try {
			await e2e.authenticate(page, 'fullAdmin');
			await createVolunteer(page, volunteer);

			await signIn(await volunteerContext.newPage(), volunteer.username, volunteer.password, BOARD_DESTINATION);
			await page.goto(`/comunicacao/usuarios?nome=${encodeURIComponent(volunteer.name)}`);

			await expect(page.getByRole('cell', { name: volunteer.name, exact: true })).toBeVisible();
		} finally {
			await volunteerContext.close();
			await deleteUserByUsername(e2e.database, volunteer.username);
		}
	});
});

test.describe('permissões do voluntário da Comunicação', () => {
	test('E2E-10 esconde do voluntário o menu Usuários e as exclusões', async ({ page, e2e }) => {
		await e2e.authenticate(page, 'comunicacao');

		const controls = await readModuleControls(page, e2e);

		expect(controls).toEqual({ users: 0, deleteTalk: 0, deleteSpeaker: 0 });
	});

	test('E2E-10 mostra à coordenação o menu Usuários e as exclusões', async ({ page, e2e }) => {
		await e2e.authenticate(page, 'fullAdmin');

		const controls = await readModuleControls(page, e2e);

		expect(controls).toEqual({ users: 1, deleteTalk: 1, deleteSpeaker: 1 });
	});
});
