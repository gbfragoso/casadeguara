import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

import { contrastRatio } from '../../support/contrast';

export const NON_TEXT_CONTRAST_RATIO = 3;

const CONTRAST_PROBE = 'tests/e2e/support/contrast-probe.js';
const FOCUSABLE =
	'a[href], button:not(:disabled), input:not([type="hidden"]):not(:disabled), select, textarea, [tabindex]';

type ContrastPair = { label: string; adjacent: string | null; candidates: (string | null)[] };
type ProbeWindow = Window & { __probeNonTextContrast?: () => ContrastPair[] };
type FocusState = { label: string; outlineStyle: string; outlineWidth: number; boxShadow: string };

const hasGradientBackground = (page: Page, selector: string) =>
	page.locator(selector).evaluate((element) => {
		for (let node: Element | null = element; node; node = node.parentElement) {
			if (getComputedStyle(node).backgroundImage.includes('gradient')) return true;
		}
		return false;
	});

export const auditTextContrast = async (page: Page) => {
	const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
	const incompleteTargets = results.incomplete.flatMap((rule) => rule.nodes.map((node) => node.target.join(' ')));
	const gradientChecks = await Promise.all(
		incompleteTargets.map((selector) => hasGradientBackground(page, selector)),
	);
	return {
		violations: results.violations.flatMap((rule) => rule.nodes.map((node) => node.target.join(' '))),
		unresolved: incompleteTargets.filter((_, index) => !gradientChecks[index]),
	};
};

const bestRatio = ({ adjacent, candidates }: ContrastPair) =>
	Math.max(...candidates.map((color) => (color && adjacent ? contrastRatio(color, adjacent) : 0)));

export const findLowContrastControls = async (page: Page) => {
	await page.addScriptTag({ path: CONTRAST_PROBE });
	const pairs = await page.evaluate(() => {
		const probeWindow: ProbeWindow = window;
		return probeWindow.__probeNonTextContrast?.() ?? null;
	});
	if (!pairs) throw new Error('A sonda de contraste não foi injetada na página.');
	return pairs
		.filter((pair) => pair.adjacent !== null)
		.map((pair) => ({ label: pair.label, ratio: bestRatio(pair) }))
		.filter(({ ratio }) => ratio < NON_TEXT_CONTRAST_RATIO);
};

const readFocusState = (page: Page): Promise<FocusState | null> =>
	page.evaluate(() => {
		const element = document.activeElement;
		if (!(element instanceof HTMLElement) || element === document.body) return null;
		const style = getComputedStyle(element);
		const label = element.getAttribute('aria-label') ?? element.textContent?.trim() ?? element.tagName;
		return {
			label,
			outlineStyle: style.outlineStyle,
			outlineWidth: parseFloat(style.outlineWidth),
			boxShadow: style.boxShadow,
		};
	});

const isIndicated = ({ outlineStyle, outlineWidth, boxShadow }: FocusState) =>
	(outlineStyle !== 'none' && outlineWidth > 0) || boxShadow !== 'none';

export const findFocusIndicatorGaps = async (page: Page) => {
	const steps = (await page.locator(FOCUSABLE).count()) + 1;
	const gaps: string[] = [];
	for (let step = 0; step < steps; step += 1) {
		await page.keyboard.press('Tab');
		const state = await readFocusState(page);
		if (!state) break;
		if (!isIndicated(state)) gaps.push(state.label);
	}
	return gaps;
};
