import type { Locator, Page } from '@playwright/test';

export const MINIMUM_TARGET_SIZE = 24;

type Rectangle = { left: number; top: number; right: number; bottom: number };
type TargetBox = Rectangle & { label: string; width: number; height: number; exempt: boolean };
export type TargetViolation = { label: string; width: number; height: number };

export const readDocumentWidth = (page: Page) =>
	page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));

export const readBox = async (locator: Locator) => {
	const box = await locator.boundingBox();
	if (!box) throw new Error('Elemento sem caixa visível.');
	return box;
};

export const isInsideViewport = (locator: Locator) =>
	locator.evaluate((element) => {
		const rect = element.getBoundingClientRect();
		return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
	});

export const isTopmostAtCenter = (locator: Locator) =>
	locator.evaluate((element) => {
		const rect = element.getBoundingClientRect();
		const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
		return hit !== null && (hit === element || element.contains(hit));
	});

// Native unmodified checkboxes and radios and links inside a sentence are WCAG 2.5.8 exceptions.
const collectTargets = (page: Page, scopeSelector = 'body'): Promise<TargetBox[]> =>
	page.evaluate((scope) => {
		const selector = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"]';
		const isNativeChoice = (element: Element) =>
			element instanceof HTMLInputElement &&
			['checkbox', 'radio'].includes(element.type) &&
			getComputedStyle(element).appearance !== 'none';
		const isInlineTextLink = (element: Element) =>
			element instanceof HTMLAnchorElement &&
			getComputedStyle(element).display === 'inline' &&
			(element.parentElement?.textContent ?? '').trim() !== (element.textContent ?? '').trim();
		const root = document.querySelector(scope);
		if (!root) throw new Error(`Região ausente da página: ${scope}`);
		return [...root.querySelectorAll(selector)]
			.filter((element) => getComputedStyle(element).visibility !== 'hidden')
			.map((element) => {
				const { left, top, right, bottom, width, height } = element.getBoundingClientRect();
				const label = element.getAttribute('aria-label') ?? element.textContent?.trim() ?? element.tagName;
				const exempt = isNativeChoice(element) || isInlineTextLink(element);
				return { label, left, top, right, bottom, width, height, exempt };
			})
			.filter((target) => target.width > 0 && target.height > 0);
	}, scopeSelector);

const spacingSquare = (target: TargetBox): Rectangle => {
	const half = MINIMUM_TARGET_SIZE / 2;
	const [x, y] = [target.left + target.width / 2, target.top + target.height / 2];
	return { left: x - half, right: x + half, top: y - half, bottom: y + half };
};

const intersects = (first: Rectangle, second: Rectangle) =>
	first.left < second.right && second.left < first.right && first.top < second.bottom && second.top < first.bottom;

const hasSpacing = (target: TargetBox, targets: readonly TargetBox[]) =>
	targets.filter((other) => other !== target).every((other) => !intersects(spacingSquare(target), other));

const isSmall = (target: TargetBox) => target.width < MINIMUM_TARGET_SIZE || target.height < MINIMUM_TARGET_SIZE;

export const findSmallTargets = async (page: Page): Promise<TargetViolation[]> => {
	const targets = await collectTargets(page);
	return targets
		.filter((target) => isSmall(target) && !target.exempt && !hasSpacing(target, targets))
		.map(({ label, width, height }) => ({ label, width, height }));
};

export const findTargetsSmallerThan = async (
	page: Page,
	scopeSelector: string,
	minimumSize: number,
): Promise<TargetViolation[]> => {
	const targets = await collectTargets(page, scopeSelector);
	return targets
		.filter((target) => !target.exempt && (target.width < minimumSize || target.height < minimumSize))
		.map(({ label, width, height }) => ({ label, width, height }));
};
