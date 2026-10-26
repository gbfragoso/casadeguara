import type { Locator, Page } from '@playwright/test';

import { createPhoto } from './amigo-fraterno-support';
import { expect, test, type E2EData } from './fixtures';
import { openBoard, ownCards, talkCard } from './palestras-browser';

type SaveTimerWindow = Window & { __e2eSaveDuration?: Promise<number> };

const TALK_COUNT = 60;
const TALKS_PER_DAY = 3;
const TIMES = ['08:45', '14:30', '19:30'];
const EDIT_COUNT = 10;
const OPEN_COUNT = 5;
const SAVE_BUDGET_MS = 1_000;
const OPEN_BUDGET_MS = 2_000;
const THUMBNAIL_SIZE = { width: 128, height: 128 };
const PERFORMANCE_TIMEOUT_MS = 120_000;

const median = (values: readonly number[]) => {
	const sorted = values.toSorted((first, second) => first - second);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};

const titleAt = (e2e: E2EData, index: number) => `${e2e.token} desempenho ${String(index).padStart(2, '0')}`;

const seedBoardWithPhotos = async (e2e: E2EData) => {
	const talks = await e2e.createTalks(
		Array.from({ length: TALK_COUNT }, (_, index) => ({
			titulo: titleAt(e2e, index),
			data: e2e.talkDate(Math.floor(index / TALKS_PER_DAY)),
			horario: TIMES[index % TALKS_PER_DAY],
		})),
	);
	const photo = await createPhoto(THUMBNAIL_SIZE);
	for (const [index, talk] of talks.entries()) {
		const speakerId = await e2e.createSpeaker({ nome: `Palestrante desempenho ${index} ${e2e.token}`, photo });
		await e2e.assignSpeaker(talk.id, speakerId);
	}
};

const startSaveTimer = (card: Locator) =>
	card.evaluate((element) => {
		const timerWindow: SaveTimerWindow = window;
		timerWindow.__e2eSaveDuration = new Promise((resolve) => {
			const start = performance.now();
			const observer = new MutationObserver(() => {
				const statuses = [...element.querySelectorAll('[role="status"]')];
				if (!statuses.some((status) => status.textContent === 'Salvo')) return;
				observer.disconnect();
				resolve(performance.now() - start);
			});
			observer.observe(element, { subtree: true, childList: true, characterData: true });
		});
	});

const readSaveDuration = (page: Page) =>
	page.evaluate(() => {
		const timerWindow: SaveTimerWindow = window;
		if (!timerWindow.__e2eSaveDuration) throw new Error('O cronômetro do salvamento não foi iniciado.');
		return timerWindow.__e2eSaveDuration;
	});

const measureTitleSave = async (page: Page, title: string) => {
	const card = talkCard(page, title);
	await card.getByRole('button', { name: `Editar título: ${title}` }).click();
	await card.getByRole('textbox', { name: 'Título' }).fill(`${title} editada`);
	await startSaveTimer(card);
	await page.keyboard.press('Enter');
	return readSaveDuration(page);
};

const measureBoardOpening = async (page: Page, e2e: E2EData) => {
	await openBoard(page);
	await expect(ownCards(page, e2e.token).nth(TALK_COUNT - 1)).toBeVisible();
	return page.evaluate(() => performance.now());
};

test.describe('desempenho do board de palestras', () => {
	test.describe.configure({ timeout: PERFORMANCE_TIMEOUT_MS });

	test(
		'salva cada edição em menos de 1 s na mediana com 60 palestras e fotos',
		{ tag: '@performance' },
		async ({ page, e2e }) => {
			await seedBoardWithPhotos(e2e);
			await e2e.authenticate(page, 'comunicacao');
			const durations: number[] = [];

			for (let index = 0; index < EDIT_COUNT; index += 1) {
				durations.push(await measureTitleSave(page, titleAt(e2e, index)));
			}

			test.info().annotations.push({ type: 'mediana-salvamento-ms', description: median(durations).toFixed(0) });
			expect(median(durations)).toBeLessThan(SAVE_BUDGET_MS);
		},
	);

	test(
		'abre o board com 60 palestras e fotos em menos de 2 s na mediana',
		{ tag: '@performance' },
		async ({ page, e2e }) => {
			await seedBoardWithPhotos(e2e);
			await e2e.authenticate(page, 'comunicacao');
			const durations: number[] = [];

			for (let index = 0; index < OPEN_COUNT; index += 1) {
				durations.push(await measureBoardOpening(page, e2e));
			}

			test.info().annotations.push({ type: 'mediana-abertura-ms', description: median(durations).toFixed(0) });
			expect(median(durations)).toBeLessThan(OPEN_BUDGET_MS);
		},
	);
});
