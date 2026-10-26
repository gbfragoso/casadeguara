import type { Locator, Page } from '@playwright/test';

import { waitForHydration } from './fixtures-hydration';

const BOARD_PATH = '/comunicacao/palestras';
const DRAG_STEPS = 12;
const GRIP_OFFSET_PX = 12;

const escapeRegExp = (text: string) => text.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const formatCivilDate = (isoDate: string) => isoDate.split('-').reverse().join('/');

export const scheduleName = (isoDate: string, time: string, title: string) =>
	new RegExp(`${escapeRegExp(formatCivilDate(isoDate))} · ${escapeRegExp(time)} · ${escapeRegExp(title)}$`);

export const openBoard = async (page: Page) => {
	await page.goto(BOARD_PATH);
	await waitForHydration(page);
};

export const talkCard = (page: Page, title: string) =>
	page.getByRole('article', { name: new RegExp(` · ${escapeRegExp(title)}$`) });

export const ownCards = (page: Page, token: string) =>
	page.getByRole('list', { name: 'Agenda de palestras' }).getByRole('article', { name: new RegExp(token) });

export const waitForTalkAction = (page: Page, action: string) =>
	page.waitForResponse(
		(response) => response.request().method() === 'POST' && response.url().endsWith(`${BOARD_PATH}?/${action}`),
	);

export const countTalkActions = (page: Page, action: string) => {
	const requests: string[] = [];
	page.on('request', (request) => {
		if (request.method() === 'POST' && request.url().endsWith(`?/${action}`)) requests.push(request.url());
	});
	return requests;
};

export const readBox = async (locator: Locator) => {
	const box = await locator.boundingBox();
	if (!box) throw new Error('O card não está visível.');
	return { x: box.x, y: box.y, width: box.width, height: box.height, centerY: box.y + box.height / 2 };
};

export const gripPoint = async (card: Locator) => {
	const box = await readBox(card);
	return { x: box.x + GRIP_OFFSET_PX, y: box.centerY };
};

export const dragWithMouse = async (page: Page, origin: Locator, target: Locator) => {
	await origin.scrollIntoViewIfNeeded();
	const start = await gripPoint(origin);
	const distance = (await readBox(target)).centerY - (await readBox(origin)).centerY;

	await page.mouse.move(start.x, start.y);
	await page.mouse.down();
	await page.mouse.move(start.x, start.y + distance, { steps: DRAG_STEPS });
	await page.mouse.up();
};

export const meetingActivities = (card: Locator) => card.getByRole('button', { name: /^Editar reunião com:/ });
