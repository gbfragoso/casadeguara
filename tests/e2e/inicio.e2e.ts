import { addCivilDays, readBahiaCivilDate } from '../../src/lib/utils/date';
import { expect, test } from './fixtures';

const ISO_DATE_LENGTH = 10;

const readBahiaTomorrow = () => addCivilDays(readBahiaCivilDate(new Date()), 1).toISOString().slice(0, ISO_DATE_LENGTH);

test.describe('página inicial pública', () => {
	test(
		'E2E-INICIO-01 o visitante vê as próximas palestras e chega ao login pela área do voluntário',
		{ tag: '@isolated' },
		async ({ page, e2e }) => {
			const data = readBahiaTomorrow();
			const [next, following] = await e2e.createTalks([
				{ titulo: `Prece ${e2e.token}`, data, horario: '08:00' },
				{ titulo: `Caridade ${e2e.token}`, data, horario: '19:30' },
			]);
			const speakerId = await e2e.createSpeaker({ nome: `Início Amorim ${e2e.token}` });
			await Promise.all([next, following].map(({ id }) => e2e.assignSpeaker(id, speakerId)));

			await page.goto('/');

			const hero = page.getByRole('region', { name: `Prece ${e2e.token}` });
			await expect(hero.getByRole('heading', { level: 1 })).toHaveText(`Prece ${e2e.token}`);
			await expect(hero).toContainText('Amanhã às 08h00');
			const upcoming = page.getByRole('region', { name: 'As próximas palestras' }).getByRole('listitem');
			await expect(upcoming.first()).toContainText(`Caridade ${e2e.token}`);

			await page.getByRole('banner').getByRole('link', { name: 'Área do voluntário' }).click();
			await expect(page).toHaveURL('/login');
			await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
		},
	);
});
