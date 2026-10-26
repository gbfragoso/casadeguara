import { test, expect } from './fixtures';
import { meetingActivities, scheduleName, waitForTalkAction } from './palestras-browser';

const DEFAULT_ACTIVITIES = [
	'Estudo do Evangelho',
	'Palestra doutrinária',
	'Passes e água fluidificada',
	'Atendimento fraterno',
	'Atendimento espiritual',
];
const MONDAY = 0;

test('E2E-04 cria uma palestra com as atividades padrão editadas', async ({ page, e2e }) => {
	const date = e2e.talkDate(MONDAY);
	const remaining = DEFAULT_ACTIVITIES.slice(1);
	await e2e.authenticate(page, 'comunicacao');

	await page.getByRole('button', { name: 'Nova palestra' }).click();
	const activities = page.getByLabel('Reunião com', { exact: true });
	await expect(activities).toHaveValue(DEFAULT_ACTIVITIES.join('\n'));
	await page.getByLabel('Data', { exact: true }).fill(date);
	await page.getByLabel('Horário', { exact: true }).fill('19:30');
	await activities.fill(remaining.join('\n'));
	const created = waitForTalkAction(page, 'criar');
	await page.getByRole('button', { name: 'Criar palestra' }).click();
	await created;

	const card = page.getByRole('article', { name: scheduleName(date, '19:30', 'Título a definir') });
	await expect(meetingActivities(card)).toHaveAccessibleName(`Editar reunião com: ${remaining.join(' ')}`);
});
