import { test as setup, type Browser } from '@playwright/test';

import { signIn } from '../../cadastros-browser';
import { EVIDENCE_LABEL, resetEvidence } from '../evidence';
import { seedBaselineDatabase } from './database-seed';
import type { BaselineRole, BaselineUser } from './people';
import { storageStatePath, writeBaselineSeed } from './state';

const ROLES: readonly BaselineRole[] = ['admin', 'reader'];

const createStorageState = async (browser: Browser, user: BaselineUser, path: string) => {
	const context = await browser.newContext();
	try {
		await signIn(await context.newPage(), user.email, user.password, '**/sistemas');
		await context.storageState({ path });
	} finally {
		await context.close();
	}
};

setup('popula a base da linha de base e cria as sessões dos perfis', async ({ browser }) => {
	await resetEvidence(EVIDENCE_LABEL);
	const { users, ...seed } = await seedBaselineDatabase(new Date());

	for (const role of ROLES) await createStorageState(browser, users[role], storageStatePath(role));

	await writeBaselineSeed({
		...seed,
		storageStates: { admin: storageStatePath('admin'), reader: storageStatePath('reader') },
	});
});
