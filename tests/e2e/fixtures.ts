import { test as base } from '@playwright/test';

import { createFixtureResources } from './fixtures-support';
import { installHydrationProbe } from './fixtures-hydration';
import type { E2EData } from './fixtures-types';

export const test = base.extend<{ e2e: E2EData }>({
	page: async ({ page }, use) => {
		await installHydrationProbe(page);
		await use(page);
	},
	e2e: async ({ page: fixturePage }, use) => {
		void fixturePage;
		const resources = await createFixtureResources();
		try {
			await use(resources.data);
		} finally {
			await resources.cleanup();
		}
	},
});

export type { E2EData } from './fixtures-types';
export { expect } from '@playwright/test';
export { waitForHydration } from './fixtures-hydration';
