import { addCivilDays, readBahiaCivilDate } from '../../src/lib/utils/date';
import { expect, test, waitForHydration, type E2EData } from './fixtures';
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
		'E2E-INICIO-05 o visitante clica em Palestras e vê a palestra do mês',
		{ tag: '@isolated' },
		async ({ page, e2e }) => {
			const today = readBahiaCivilDate(new Date()).toISOString().slice(0, ISO_DATE_LENGTH);
			await createPublishedTalks(e2e, [{ titulo: `Perdão ${e2e.token}`, data: today, horario: '23:59' }]);
			await page.setViewportSize({ width: 1280, height: 800 });
			await page.goto('/');
			await waitForHydration(page);

			await page
				.getByRole('navigation', { name: 'Menu do site' })
				.getByRole('link', { name: 'Palestras' })
				.click();

			await expect(page).toHaveURL('/palestras');
			const monthTalks = page.getByRole('list', { name: 'Palestras do mês' });
			await expect(monthTalks.getByRole('listitem')).toContainText([`Perdão ${e2e.token}`]);
		},
	);

	test('E2E-INICIO-03 o visitante abre Departamentos e chega ao Recanto de Potira', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await waitForHydration(page);

		const menu = page.getByRole('navigation', { name: 'Menu do site' });
		await menu.getByRole('button', { name: 'Departamentos' }).click();
		await menu.getByRole('link', { name: 'Recanto de Potira' }).click();

		await expect(page).toHaveURL('/departamentos/recanto');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Recanto de Potira');
		await expect(menu.getByRole('button', { name: /Departamentos/ })).toHaveAttribute('aria-expanded', 'false');
	});

	test('E2E-INICIO-04 no celular, o grupo abre como acordeão dentro do menu', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');
		await waitForHydration(page);

		await page.getByRole('button', { name: 'Menu' }).click();
		const menu = page.getByRole('navigation', { name: 'Menu do site' });
		await menu.getByRole('button', { name: 'Material de Estudo' }).click();
		await menu.getByRole('link', { name: 'Curso de Passes' }).click();

		await expect(page).toHaveURL('/material-de-estudo/curso-de-passes');
		await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
	});

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
