import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { SeedCalendar } from './calendar';
import type { BaselineRole } from './people';

export type BaselineSeed = {
	calendar: SeedCalendar;
	cadastroWithPhotoId: number;
	bookWithCopiesId: number;
	loanReceiptId: number;
	storageStates: Record<BaselineRole, string>;
};

const SEED_STATE_DIRECTORY = join('test-results', 'linha-de-base-seed');
const SEED_STATE_FILE = join(SEED_STATE_DIRECTORY, 'seed.json');

export const storageStatePath = (role: BaselineRole) => join(SEED_STATE_DIRECTORY, `sessao-${role}.json`);

export const writeBaselineSeed = async (seed: BaselineSeed) => {
	await mkdir(SEED_STATE_DIRECTORY, { recursive: true });
	await writeFile(SEED_STATE_FILE, JSON.stringify(seed, null, '\t'));
};

export const readBaselineSeed = async (): Promise<BaselineSeed> => JSON.parse(await readFile(SEED_STATE_FILE, 'utf8'));
