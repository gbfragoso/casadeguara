import { addCivilDays, readBahiaCivilDate } from '../../src/lib/utils/date';
import { expect, test, type E2EData } from './fixtures';
import type { TalkSeed } from './palestras-database';

const ISO_DATE_LENGTH = 10;

const readBahiaTomorrow = () => addCivilDays(readBahiaCivilDate(new Date()), 1).toISOString().slice(0, ISO_DATE_LENGTH);

const createPublishedTalks = async (e2e: E2EData, seeds: readonly TalkSeed[]) => {
	const talks = await e2e.createTalks(seeds);
	const speakerId = await e2e.createSpeaker({ nome: `Início Amorim ${e2e.token}` });
	await Promise.all(talks.map(({ id }) => e2e.assignSpeaker(id, speakerId)));
};

test.describe('página inicial pública', () => {
	test.describe.configure({ mode: 'default' });

	test(
		'E2E-INICIO-01 o visitante vê as próximas palestras e chega ao login pela Login',
		{ tag: '@isolated' },
		async ({ page, e2e }) => {
			const data = readBahiaTomorrow();
			await createPublishedTalks(e2e, [
				{ titulo: `Prece ${e2e.token}`, data, horario: '08:00' },
				{ titulo: `Caridade ${e2e.token}`, data, horario: '19:30' },
			]);

			await page.goto('/');

			const hero = page.getByRole('region', { name: `Prece ${e2e.token}` });
			await expect(hero.getByRole('heading', { level: 1 })).toHaveText(`Prece ${e2e.token}`);
			await expect(hero).toContainText('Amanhã às 08h00');
			const upcoming = page.getByRole('region', { name: 'As próximas palestras' }).getByRole('listitem');
			await expect(upcoming.first()).toContainText(`Caridade ${e2e.token}`);

			await page.getByRole('banner').getByRole('link', { name: 'Login' }).click();
			await expect(page).toHaveURL('/login');
			await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
		},
	);

	test(
		'E2E-INICIO-02 o visitante que reduz o movimento lê o título da palestra sem a digitação',
		{ tag: '@isolated' },
		async ({ page, e2e }) => {
			await createPublishedTalks(e2e, [
				{ titulo: `Prece ${e2e.token}`, data: readBahiaTomorrow(), horario: '08:00' },
			]);
			await page.emulateMedia({ reducedMotion: 'reduce' });

			await page.goto('/');

			const heading = page.getByRole('heading', { level: 1, name: `Prece ${e2e.token}` });
			await expect(heading.locator('span').last()).toHaveCSS('animation-name', 'none');
		},
	);
});
