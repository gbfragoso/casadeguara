import { expect, type Page } from '@playwright/test';

export const photoPath = (id: number, original = false) =>
	`/secretaria/cadastros/${id}/foto${original ? '/original' : ''}`;

export const waitForPhoto = (page: Page, id: number, original = false) =>
	page.waitForResponse(
		(response) =>
			response.request().method() === 'GET' && new URL(response.url()).pathname === photoPath(id, original),
	);

export const expectLoadedPhoto = async (photo: import('@playwright/test').Locator, path: string) => {
	await expect(photo).toBeVisible();
	await expect
		.poll(async () =>
			photo.evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0),
		)
		.toBe(true);
	await expect
		.poll(async () =>
			photo.evaluate((image) => (image instanceof HTMLImageElement ? new URL(image.currentSrc).pathname : '')),
		)
		.toBe(path);
};

export const submitPhotoAction = async (page: Page, id: number, action: () => Promise<void>) => {
	const responsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			new URL(response.url()).pathname === `/secretaria/cadastros/${id}`,
	);
	await action();
	const response = await responsePromise;
	expect(response.ok()).toBe(true);
};

export const submitFlag = async (page: Page, action: () => Promise<void>) => {
	const responsePromise = page.waitForResponse(
		(response) => response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/cadastros',
	);
	await action();
	expect((await responsePromise).ok()).toBe(true);
};
