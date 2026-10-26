import { test, expect, type E2EData } from './fixtures';
import {
	countTalkActions,
	dragWithMouse,
	openBoard,
	ownCards,
	scheduleName,
	talkCard,
	waitForTalkAction,
} from './palestras-browser';

const DEFAULT_LOCATION = 'Rua Major Dórea, 86, Castália, Itabuna-BA';
const CONFLICT_MESSAGE = 'Outra pessoa alterou esta programação. O board foi atualizado; confira e tente de novo.';
const MONDAY = 0;
const SATURDAY = 5;
const SUNDAY = 6;
const NEXT_MONDAY = 7;
const MONDAY_IN_TWO_WEEKS = 14;

const seedMonth = async (e2e: E2EData) => {
	const titles = { a: `${e2e.token} A`, b: `${e2e.token} B`, c: `${e2e.token} C` };
	const [a, b, c] = await e2e.createTalks([
		{ titulo: titles.a, data: e2e.talkDate(MONDAY), horario: '08:45' },
		{ titulo: titles.b, data: e2e.talkDate(SATURDAY), horario: '14:30' },
		{ titulo: titles.c, data: e2e.talkDate(NEXT_MONDAY), horario: '08:45' },
	]);
	return { a, b, c, titles };
};

test('E2E-02 monta o mês com sugestões, edição no card e reordenação por data', async ({ page, e2e }) => {
	const { titles } = await seedMonth(e2e);
	const newDate = e2e.talkDate(MONDAY_IN_TWO_WEEKS);
	await e2e.authenticate(page, 'comunicacao');

	await page.getByRole('button', { name: 'Nova palestra' }).click();
	await page.getByLabel('Data', { exact: true }).fill(newDate);
	await expect(page.getByLabel('Horário', { exact: true })).toHaveValue('08:45');
	await expect(page.getByLabel('Local', { exact: true })).toHaveValue(DEFAULT_LOCATION);
	const created = waitForTalkAction(page, 'criar');
	await page.getByRole('button', { name: 'Criar palestra' }).click();
	await created;

	const newCard = page.getByRole('article', { name: scheduleName(newDate, '08:45', 'Título a definir') });
	await newCard.getByRole('button', { name: 'Editar título: Título a definir' }).click();
	await newCard.getByRole('textbox', { name: 'Título' }).fill(`${e2e.token} D`);
	const titled = waitForTalkAction(page, 'atualizar');
	await newCard.getByRole('textbox', { name: 'Título' }).blur();
	await titled;
	await openBoard(page);
	const titledCard = talkCard(page, `${e2e.token} D`);
	await expect(titledCard).toHaveAccessibleName(scheduleName(newDate, '08:45', `${e2e.token} D`));

	await titledCard.getByRole('button', { name: `Editar título: ${e2e.token} D` }).click();
	await titledCard.getByRole('textbox', { name: 'Título' }).fill('Descartado');
	await titledCard.getByRole('textbox', { name: 'Título' }).press('Escape');
	await expect(titledCard.getByRole('button', { name: `Editar título: ${e2e.token} D` })).toBeFocused();

	const cardA = talkCard(page, titles.a);
	await cardA.getByRole('button', { name: /^Editar data:/ }).click();
	await cardA.getByLabel('Data', { exact: true }).fill(e2e.talkDate(SUNDAY));
	const moved = waitForTalkAction(page, 'atualizar');
	await cardA.getByLabel('Data', { exact: true }).press('Enter');
	await moved;

	const cards = ownCards(page, e2e.token);
	await expect(cards.nth(0)).toHaveAccessibleName(scheduleName(e2e.talkDate(SATURDAY), '14:30', titles.b));
	await expect(cards.nth(1)).toHaveAccessibleName(scheduleName(e2e.talkDate(SUNDAY), '08:45', titles.a));
	await expect(cards.nth(2)).toHaveAccessibleName(scheduleName(e2e.talkDate(NEXT_MONDAY), '08:45', titles.c));
});

test('E2E-03 troca as datas ao arrastar um card com o mouse', async ({ page, e2e }) => {
	const { a, b, titles } = await seedMonth(e2e);
	await e2e.authenticate(page, 'comunicacao');
	const moves = countTalkActions(page, 'mover');

	const moved = waitForTalkAction(page, 'mover');
	await dragWithMouse(page, talkCard(page, titles.a), talkCard(page, titles.b));
	await moved;

	await expect(talkCard(page, titles.b)).toHaveAccessibleName(scheduleName(e2e.talkDate(MONDAY), '08:45', titles.b));
	await expect(talkCard(page, titles.a)).toHaveAccessibleName(
		scheduleName(e2e.talkDate(SATURDAY), '14:30', titles.a),
	);
	expect(moves).toHaveLength(1);
	expect(await e2e.readTalks([a.id, b.id])).toMatchObject([
		{ id: a.id, data: e2e.talkDate(SATURDAY), horario: '14:30' },
		{ id: b.id, data: e2e.talkDate(MONDAY), horario: '08:45' },
	]);
});

test('E2E-05 troca as datas só com o teclado e anuncia a nova data', async ({ page, e2e }) => {
	const { titles } = await seedMonth(e2e);
	await e2e.authenticate(page, 'comunicacao');
	const moveDown = talkCard(page, titles.a).getByRole('button', { name: `Mover para baixo: ${titles.a}` });

	await moveDown.focus();
	const moved = waitForTalkAction(page, 'mover');
	await page.keyboard.press('Enter');
	await moved;

	await expect(talkCard(page, titles.a)).toHaveAccessibleName(
		scheduleName(e2e.talkDate(SATURDAY), '14:30', titles.a),
	);
	await expect(talkCard(page, titles.b)).toHaveAccessibleName(scheduleName(e2e.talkDate(MONDAY), '08:45', titles.b));
	await expect(moveDown).toBeFocused();
	await expect(page.getByRole('status').filter({ hasText: 'agora em' })).toHaveText(
		new RegExp(`«${titles.a}» agora em Sábado, .* · 14:30`),
	);
});

test('E2E-06 recusa a troca quando outra pessoa alterou a palestra', async ({ browser, page, e2e }) => {
	const { a, b, titles } = await seedMonth(e2e);
	await e2e.authenticate(page, 'comunicacao');
	const otherContext = await browser.newContext();
	try {
		const otherPage = await otherContext.newPage();
		await e2e.authenticate(otherPage, 'fullAdmin');
		await openBoard(otherPage);
		const otherCard = talkCard(otherPage, titles.b);
		await otherCard.getByRole('button', { name: `Editar título: ${titles.b}` }).click();
		await otherCard.getByRole('textbox', { name: 'Título' }).fill(`${titles.b} alterada`);
		const changed = waitForTalkAction(otherPage, 'atualizar');
		await otherCard.getByRole('textbox', { name: 'Título' }).press('Enter');
		await changed;
	} finally {
		await otherContext.close();
	}

	const refused = waitForTalkAction(page, 'mover');
	await dragWithMouse(page, talkCard(page, titles.a), talkCard(page, titles.b));
	expect((await refused).status()).toBe(409);

	await expect(page.getByRole('alert').filter({ hasText: CONFLICT_MESSAGE })).toBeVisible();
	await expect(talkCard(page, `${titles.b} alterada`)).toHaveAccessibleName(
		scheduleName(e2e.talkDate(SATURDAY), '14:30', `${titles.b} alterada`),
	);
	expect(await e2e.readTalks([a.id, b.id])).toMatchObject([
		{ id: a.id, data: e2e.talkDate(MONDAY) },
		{ id: b.id, data: e2e.talkDate(SATURDAY) },
	]);
});
