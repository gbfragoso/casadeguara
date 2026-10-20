import { expect, test } from '@playwright/test';

import { applyViewport } from './capture';
import { EVIDENCE_LABEL } from './evidence';
import { collectInventory, mergeInventoryParts, writeInventoryPart } from './inventory';
import { EXPECTED_INVENTORY_COUNT, REPRESENTATIVE_SCREENS } from './screens';
import { runInState } from './screen-session';
import { readBaselineSeed } from './seed/state';
import type { InvariantInventory } from './types';
import { expectedRegions, inventoryViewports } from './viewports';

const inventoryKey = (screen: string, state: string, viewport: string) => `${screen}/${state}/${viewport}`;

const expectedRegionsByInventory = () =>
	REPRESENTATIVE_SCREENS.flatMap((screen) =>
		screen.states.flatMap((state) =>
			inventoryViewports(state).map((size) => ({
				key: inventoryKey(screen.id, state.id, size.viewport),
				regions: expectedRegions(screen, state, size.width),
			})),
		),
	);

const regionsByInventory = (inventories: InvariantInventory[]) =>
	inventories.map((inventory) => ({
		key: inventoryKey(inventory.screen, inventory.state, inventory.viewport),
		regions: [...new Set(inventory.entries.map((entry) => entry.region))].sort(),
	}));

test.describe('inventário de invariantes', () => {
	test.describe.configure({ mode: 'default' });
	test.skip(EVIDENCE_LABEL !== 'linha-de-base', 'A proposta não tem inventário próprio.');

	for (const screen of REPRESENTATIVE_SCREENS) {
		test(`inventaria ${screen.id}`, async ({ browser }) => {
			const seed = await readBaselineSeed();
			const inventories: InvariantInventory[] = [];

			for (const state of screen.states) {
				const sizes = inventoryViewports(state);
				await runInState(browser, { screen, state, seed }, sizes[0], async (page) => {
					for (const size of sizes) {
						await applyViewport(page, { ...size, scheme: 'light', media: 'screen' });
						const entries = await collectInventory(page);
						inventories.push({ screen: screen.id, state: state.id, viewport: size.viewport, entries });
					}
				});
			}

			await writeInventoryPart(EVIDENCE_LABEL, screen.id, inventories);
		});
	}

	test('E2E-LB02 — gera o inventário de invariantes', async () => {
		const expected = expectedRegionsByInventory();

		const inventories = await mergeInventoryParts(
			EVIDENCE_LABEL,
			REPRESENTATIVE_SCREENS.map((screen) => screen.id),
		);

		expect(expected).toHaveLength(EXPECTED_INVENTORY_COUNT);
		expect(regionsByInventory(inventories)).toEqual(expected);
	});
});
