import type { Page } from '@playwright/test';

import { waitForHydration, type E2EData } from './fixtures';
import { insertReversals } from './lancamentos-database';
import { createEntrySeed } from './lancamentos-fixture';

export const REVERSAL_REASON = 'Valor lançado em duplicidade E2E';

const createReceiptEntry = async (e2e: E2EData, suffix: string) => {
	const contributor = await e2e.createParticipant(suffix);
	const entry = await e2e.createLancamento(createEntrySeed(e2e.token, suffix, contributor.id));
	if (!entry.uuidRecibo) throw new Error('Lançamento de teste sem recibo.');
	return { contributor, entry, uuid: entry.uuidRecibo };
};

const openReceipt = async (page: Page, uuid: string) => {
	await page.goto(`/recibo/${uuid}`);
	await waitForHydration(page);
};

export const openActiveReceipt = async (page: Page, e2e: E2EData) => {
	const receipt = await createReceiptEntry(e2e, 'recibo-ativo');
	await openReceipt(page, receipt.uuid);
	return receipt;
};

export const openReversedReceipt = async (page: Page, e2e: E2EData) => {
	const receipt = await createReceiptEntry(e2e, 'recibo-estornado');
	await insertReversals(e2e.database, [receipt.entry.id], REVERSAL_REASON);
	await openReceipt(page, receipt.uuid);
	return receipt;
};
