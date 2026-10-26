import type { Page } from '@playwright/test';

import { expect, test, type E2EData } from './fixtures';
import { createPhoto } from './amigo-fraterno-support';
import { auditWcagViolations } from './support/accessibility';
import { findTargetsSmallerThan, readDocumentWidth } from './support/geometry';
import { openCatalogRoute } from './support/module-shell';
import { selectRoutes, type CatalogRoute } from './support/route-catalog';
import { COMUNICACAO_ROUTES } from './support/route-catalog/comunicacao';
import { talkCard } from './palestras-browser';

const COLOR_SCHEMES = ['light', 'dark'] as const;
const PHONE_VIEWPORT = { width: 390, height: 844 };
const MINIMUM_TOUCH_TARGET_PX = 44;
const THUMBNAIL_SIZE = { width: 128, height: 128 };
const AGENDA_SELECTOR = '[aria-label="Agenda de palestras"]';
const [BOARD] = selectRoutes(['comunicacao-palestras']);

const boardCardTitle = (e2e: E2EData) => `${e2e.token} acessível`;

const seedBoardCard = async (e2e: E2EData) => {
	const [talk] = await e2e.createTalks([{ titulo: boardCardTitle(e2e), data: e2e.talkDate(0), horario: '08:45' }]);
	const photo = await createPhoto(THUMBNAIL_SIZE);
	const speakerId = await e2e.createSpeaker({ nome: `Palestrante acessível ${e2e.token}`, photo });
	await e2e.assignSpeaker(talk.id, speakerId);
};

const openModuleScreen = async (page: Page, e2e: E2EData, route: CatalogRoute) => {
	await seedBoardCard(e2e);
	await openCatalogRoute(page, e2e, route);
	await expect(page.locator('main')).toBeVisible();
};

test.describe('acessibilidade das telas da Comunicação', () => {
	for (const route of COMUNICACAO_ROUTES) {
		for (const scheme of COLOR_SCHEMES) {
			test(`E2E-11 não tem violações do axe em ${route.id} no tema ${scheme}`, async ({ page, e2e }) => {
				await page.emulateMedia({ colorScheme: scheme });
				await openModuleScreen(page, e2e, route);

				const violations = await auditWcagViolations(page);

				expect(violations).toEqual([]);
			});
		}

		test(`E2E-11 não exige rolagem horizontal em 390 px em ${route.id}`, async ({ page, e2e }) => {
			await page.setViewportSize(PHONE_VIEWPORT);
			await openModuleScreen(page, e2e, route);

			const { scrollWidth, innerWidth } = await readDocumentWidth(page);

			expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
		});
	}

	test('E2E-11 oferece alvos de toque de 44 px nos cards do board em 390 px', async ({ page, e2e }) => {
		await page.setViewportSize(PHONE_VIEWPORT);
		await openModuleScreen(page, e2e, BOARD);
		await expect(talkCard(page, boardCardTitle(e2e))).toBeVisible();

		const violations = await findTargetsSmallerThan(page, AGENDA_SELECTOR, MINIMUM_TOUCH_TARGET_PX);

		expect(violations).toEqual([]);
	});
});
