import type { Page } from '@playwright/test';

type HydrationWindow = Window & { __e2eHydrated?: boolean };

export const installHydrationProbe = (page: Page) =>
	page.addInitScript(() => {
		const original = EventTarget.prototype.addEventListener;
		EventTarget.prototype.addEventListener = function (type, listener, options) {
			if (this instanceof Element) {
				(window as HydrationWindow).__e2eHydrated = true;
			}
			return original.call(this, type, listener, options);
		};
	});

export const waitForHydration = (page: Page) =>
	page.waitForFunction(() => (window as HydrationWindow).__e2eHydrated === true);
