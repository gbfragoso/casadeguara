import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { findClassLocators, listTestSources } from './support/class-locators';

const GUARD_FILES = [
	join('tests', 'unit', 'lib', 'styles', 'class-locators.test.ts'),
	join('tests', 'unit', 'lib', 'styles', 'support', 'class-locators.ts'),
	join('tests', 'unit', 'lib', 'styles', 'bulma-residue.test.ts'),
	join('tests', 'unit', 'lib', 'styles', 'support', 'bulma-residue.ts'),
];

describe('class locators in tests', () => {
	it('reports class selectors, class attribute selectors and class assertions', () => {
		const source = [
			"page.locator('form.card');",
			'document.querySelectorAll(".mt-2 > .column");',
			'receipt.querySelector(\'i, [class*="fa-"]\');',
			'element.closest(`${COPY} .assinatura`);',
			'await expect(button).toHaveClass(/is-loading/);',
			"expect(dropdown.classList.contains('is-active')).toBe(true);",
		].join('\n');

		const violations = findClassLocators('sample.ts', source);

		expect(violations.map(({ line }) => line)).toEqual([5, 6, 1, 2, 3, 4]);
	});

	it('accepts role, label, text, state and test id locators', () => {
		const source = [
			'page.locator(\'[data-testid="recibo-termico"]\');',
			'document.querySelector(\'section[aria-label="Via do leitor. Cópia"]\');',
			'page.locator(\'text="R$ 1.234,56"\');',
			"target.querySelector<HTMLButtonElement>('#reenquadrar-foto');",
			"button.closest('[hidden]');",
			"page.locator('img:visible');",
		].join('\n');

		const violations = findClassLocators('sample.ts', source);

		expect(violations).toEqual([]);
	});

	it('keeps every test free of class locators and class assertions', () => {
		const sources = listTestSources('tests', GUARD_FILES);

		const violations = sources.flatMap(({ file, source }) => findClassLocators(file, source));

		expect(sources.length).toBeGreaterThan(0);
		expect(violations).toEqual([]);
	});
});
