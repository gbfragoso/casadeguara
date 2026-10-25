import type { CDPSession, Page } from '@playwright/test';

import { test, expect } from './fixtures';
import {
	countTalkActions,
	gripPoint,
	openBoard,
	readBox,
	scheduleName,
	talkCard,
	waitForTalkAction,
} from './palestras-browser';

type Point = { x: number; y: number };

const LONG_PRESS_MS = 450;
const SWIPE_DISTANCE_PX = 200;
const TOUCH_STEPS = 10;
const MONDAY = 0;
const SATURDAY = 5;

test.use({ hasTouch: true, viewport: { width: 390, height: 700 } });

const touch = (session: CDPSession, type: 'touchStart' | 'touchMove' | 'touchEnd', point?: Point) =>
	session.send('Input.dispatchTouchEvent', { type, touchPoints: point ? [point] : [] });

const slideFinger = async (session: CDPSession, from: Point, to: Point) => {
	for (let step = 1; step <= TOUCH_STEPS; step += 1) {
		const progress = step / TOUCH_STEPS;
		await touch(session, 'touchMove', { x: from.x, y: from.y + (to.y - from.y) * progress });
	}
};

const readScrollY = (page: Page) => page.evaluate(() => window.scrollY);

test('E2E-04 troca por pressão longa no toque e só rola ao deslizar sem segurar', async ({ page, e2e }) => {
	const titles = { a: `${e2e.token} A`, b: `${e2e.token} B` };
	const [a, b] = await e2e.createTalks([
		{ titulo: titles.a, data: e2e.talkDate(MONDAY), horario: '08:45' },
		{ titulo: titles.b, data: e2e.talkDate(SATURDAY), horario: '14:30' },
	]);
	await page.clock.install();
	await e2e.authenticate(page, 'comunicacao');
	await openBoard(page);
	const session = await page.context().newCDPSession(page);
	const moves = countTalkActions(page, 'mover');
	const cardA = talkCard(page, titles.a);
	await cardA.evaluate((card) => card.scrollIntoView({ block: 'center' }));

	const swipeStart = await gripPoint(cardA);
	const scrollBefore = await readScrollY(page);
	await touch(session, 'touchStart', swipeStart);
	await slideFinger(session, swipeStart, { x: swipeStart.x, y: swipeStart.y - SWIPE_DISTANCE_PX });
	await touch(session, 'touchEnd');
	await expect.poll(() => readScrollY(page)).toBeGreaterThan(scrollBefore);
	expect(moves).toHaveLength(0);

	await cardA.evaluate((card) => card.scrollIntoView({ block: 'center' }));
	const holdStart = await gripPoint(cardA);
	const target = await readBox(talkCard(page, titles.b));
	await touch(session, 'touchStart', holdStart);
	await page.clock.runFor(LONG_PRESS_MS);
	const moved = waitForTalkAction(page, 'mover');
	await slideFinger(session, holdStart, { x: holdStart.x, y: target.centerY });
	await touch(session, 'touchEnd');
	await moved;

	await expect(talkCard(page, titles.a)).toHaveAccessibleName(
		scheduleName(e2e.talkDate(SATURDAY), '14:30', titles.a),
	);
	expect(moves).toHaveLength(1);
	expect(await e2e.readTalks([a.id, b.id])).toMatchObject([
		{ id: a.id, data: e2e.talkDate(SATURDAY) },
		{ id: b.id, data: e2e.talkDate(MONDAY) },
	]);
});
