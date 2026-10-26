import { test, expect, waitForHydration } from './fixtures';
import {
	artAction,
	artDialog,
	formatCivilDate,
	meetingActivities,
	openArt,
	readPreviewSize,
	scheduleName,
	talkCard,
	waitForTalkAction,
} from './palestras-browser';
import {
	ART_SIZE_PX,
	ART_TIME,
	artDate,
	artTitle,
	openReadyCard,
	seedReadyTalk,
	speakerName,
} from './palestras-arte-support';
import { auditWcagViolations } from './support/accessibility';
import { readDocumentWidth } from './support/geometry';

const DEFAULT_ACTIVITIES = [
	'Estudo do Evangelho',
	'Palestra doutrinária',
	'Passes e água fluidificada',
	'Atendimento fraterno',
	'Atendimento espiritual',
];
const MONDAY = 0;
const PAST_DAYS = 7;
const DAY_MS = 86_400_000;
const ISO_DATE_LENGTH = 10;
const SMALL_PHONE_VIEWPORT = { width: 360, height: 740 };
const HISTORY_PATH = '/comunicacao/palestras?visao=historico';
const ART_SIZE = { width: ART_SIZE_PX, height: ART_SIZE_PX };

const pastDate = () => new Date(Date.now() - PAST_DAYS * DAY_MS).toISOString().slice(0, ISO_DATE_LENGTH);

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

test('E2E-01 gera a arte de um card da agenda como voluntário', async ({ page, e2e }) => {
	const card = await openReadyCard(page, e2e);

	const preview = await openArt(page, card);

	expect(await readPreviewSize(preview)).toEqual(ART_SIZE);
});

test('E2E-02 gera a arte de um card somente leitura do histórico', async ({ page, e2e }) => {
	await seedReadyTalk(e2e, pastDate());
	await e2e.authenticate(page, 'comunicacao');
	await page.goto(HISTORY_PATH);
	await waitForHydration(page);
	const history = page.getByRole('list', { name: 'Histórico de palestras' });
	const card = history.getByRole('article', { name: new RegExp(artTitle(e2e)) });

	const preview = await openArt(page, card);

	await expect(card.getByRole('button', { name: /^Editar/ })).toHaveCount(0);
	expect(await readPreviewSize(preview)).toEqual(ART_SIZE);
});

test('E2E-03 explica o que falta em vez de abrir a prévia', async ({ page, e2e }) => {
	await e2e.createTalks([{ titulo: artTitle(e2e), data: artDate(e2e), horario: ART_TIME }]);
	await e2e.authenticate(page, 'comunicacao');
	const card = talkCard(page, artTitle(e2e));

	await artAction(card).click();

	await expect(card.getByRole('alert')).toHaveText('Para gerar a arte, defina o palestrante da palestra.');
	await expect(artDialog(page)).toHaveCount(0);
});

test('E2E-08 opera o diálogo da prévia pelo teclado', async ({ page, e2e }) => {
	const card = await openReadyCard(page, e2e);
	const action = artAction(card);
	await action.focus();

	await page.keyboard.press('Enter');
	await expect(artDialog(page)).toBeFocused();
	await expect(artDialog(page).getByRole('img')).toBeVisible();
	await page.keyboard.press('Tab');
	await expect(artDialog(page).getByRole('link', { name: 'Baixar' })).toBeFocused();
	await page.keyboard.press('Escape');

	await expect(artDialog(page)).toBeHidden();
	await expect(action).toBeFocused();
});

test('E2E-08 descreve a prévia com título, data, horário e palestrante', async ({ page, e2e }) => {
	const card = await openReadyCard(page, e2e);

	const preview = await openArt(page, card);

	await expect(preview).toHaveAccessibleName(
		`Arte de divulgação da palestra “${artTitle(e2e)}”, em ${formatCivilDate(artDate(e2e))}, ` +
			`às 19h30, com ${speakerName(e2e)}.`,
	);
});

test('E2E-08 mostra a prévia sem rolagem horizontal em 360 px', async ({ page, e2e }) => {
	await page.setViewportSize(SMALL_PHONE_VIEWPORT);
	const card = await openReadyCard(page, e2e);

	const preview = await openArt(page, card);

	const { scrollWidth, innerWidth } = await readDocumentWidth(page);
	const box = await preview.boundingBox();
	expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
	expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(SMALL_PHONE_VIEWPORT.width);
});

test('E2E-08 não tem violações do axe com a prévia aberta', async ({ page, e2e }) => {
	const card = await openReadyCard(page, e2e);
	await openArt(page, card);

	const violations = await auditWcagViolations(page);

	expect(violations).toEqual([]);
});
