import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { Page } from '@playwright/test';

import { evidenceDirectory, INVENTORY_FILE, inventoryPartsDirectory, type EvidenceLabel } from './evidence';
import type { InventoryEntry, InvariantInventory } from './types';

type InventoryWindow = Window & { __baselineInventory?: { collect: () => InventoryEntry[] } };

const partPath = (label: EvidenceLabel, screenId: string) => join(inventoryPartsDirectory(label), `${screenId}.json`);

export const collectInventory = async (page: Page) => {
	const entries = await page.evaluate(() => {
		const inventoryWindow: InventoryWindow = window;
		return inventoryWindow.__baselineInventory?.collect() ?? null;
	});
	if (!entries) throw new Error('O coletor do inventário não foi injetado na página.');
	return entries;
};

export const writeInventoryPart = (label: EvidenceLabel, screenId: string, inventories: InvariantInventory[]) =>
	writeFile(partPath(label, screenId), JSON.stringify(inventories));

const readInventoryPart = async (label: EvidenceLabel, screenId: string): Promise<InvariantInventory[]> => {
	try {
		return JSON.parse(await readFile(partPath(label, screenId), 'utf8'));
	} catch (cause) {
		throw new Error(`O inventário da tela ${screenId} não foi gerado.`, { cause });
	}
};

export const mergeInventoryParts = async (label: EvidenceLabel, screenIds: readonly string[]) => {
	const parts = await Promise.all(screenIds.map((screenId) => readInventoryPart(label, screenId)));
	const inventories = parts.flat();
	await writeFile(join(evidenceDirectory(label), INVENTORY_FILE), JSON.stringify(inventories, null, '\t'));
	return inventories;
};
