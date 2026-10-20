import type { Page } from '@playwright/test';

export const formWithField = (page: Page, label: string) =>
	page.locator('form').filter({ has: page.getByLabel(label, { exact: true }) });
