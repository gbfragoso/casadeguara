import type { Page } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

import { createLongReader } from './emprestimos-recibo-browser';
import { waitForHydration, type E2EData } from './fixtures';
import type { Participant } from './fixtures-types';
import { insertReversals } from './lancamentos-database';
import { createEntrySeed } from './lancamentos-fixture';

export const REVERSAL_REASON = 'Valor lançado em duplicidade E2E';

const MAX_DESCRIPTION_LENGTH = 200;
const LARGEST_RECEIPT_VALUE = '999999.99';
const LONG_DESCRIPTION =
	'Mensalidades de janeiro a dezembro de 2026, campanha do quilo e doação para a reforma do salão. ';

type EntryOptions = Parameters<typeof createEntrySeed>[3];

const insertReceiptEntry = async (e2e: E2EData, contributor: Participant, suffix: string, options?: EntryOptions) => {
	const entry = await e2e.createLancamento(createEntrySeed(e2e.token, suffix, contributor.id, options));
	if (!entry.uuidRecibo) throw new Error('Lançamento de teste sem recibo.');
	return { contributor, entry, uuid: entry.uuidRecibo };
};

const createReceiptEntry = async (e2e: E2EData, suffix: string) =>
	insertReceiptEntry(e2e, await e2e.createParticipant(suffix), suffix);

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

export const openLongestReceipt = async (page: Page, e2e: E2EData) => {
	const descricao = `E2E ${e2e.token} ${LONG_DESCRIPTION.repeat(3)}`.slice(0, MAX_DESCRIPTION_LENGTH);
	const receipt = await insertReceiptEntry(e2e, await createLongReader(e2e), 'recibo-longo', {
		descricao,
		valor: LARGEST_RECEIPT_VALUE,
	});
	await openReceipt(page, receipt.uuid);
	return { ...receipt, descricao };
};

export const readPdfPageSizes = async (bytes: Uint8Array) => {
	const document = await PDFDocument.load(bytes);
	return document.getPages().map((pdfPage) => pdfPage.getSize());
};
