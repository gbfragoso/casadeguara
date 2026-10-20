import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const SCANNED_EXTENSIONS = new Set(['.ts', '.js', '.svelte']);

const CLASS_ASSERTION = /\btoHaveClass\b|\bclassList\b/g;

// Captures the first string argument of a locator call, including generic calls such as querySelector<T>('…').
const LOCATOR_CALL =
	/\b(?:locator|querySelectorAll|querySelector|closest)\s*(?:<[^>()]*>)?\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;

const ATTRIBUTE_SELECTOR = /\[[^\]]*\]/g;
const QUOTED_TEXT = /(['"])(?:\\.|(?!\1).)*\1/g;
const CLASS_ATTRIBUTE_SELECTOR = /\[\s*class\b/;
const CLASS_SELECTOR = /\.-?[A-Za-z_]/;

export interface ClassLocatorViolation {
	file: string;
	line: number;
	excerpt: string;
}

export const usesClassSelector = (selector: string) => {
	if (CLASS_ATTRIBUTE_SELECTOR.test(selector)) return true;
	const structuralSelector = selector.replace(ATTRIBUTE_SELECTOR, '').replace(QUOTED_TEXT, '');
	return CLASS_SELECTOR.test(structuralSelector);
};

const lineAt = (source: string, index: number) => source.slice(0, index).split('\n').length;

export const findClassLocators = (file: string, source: string): ClassLocatorViolation[] => {
	const assertions = [...source.matchAll(CLASS_ASSERTION)].map((match) => ({
		file,
		line: lineAt(source, match.index),
		excerpt: match[0],
	}));
	const locators = [...source.matchAll(LOCATOR_CALL)]
		.filter((match) => usesClassSelector(match[2]))
		.map((match) => ({ file, line: lineAt(source, match.index), excerpt: match[0] }));
	return [...assertions, ...locators];
};

export const listTestSources = (root: string, excludedFiles: readonly string[]) =>
	readdirSync(root, { recursive: true, encoding: 'utf8' })
		.map((relativePath) => join(root, relativePath))
		.filter((file) => SCANNED_EXTENSIONS.has(extname(file)) && !excludedFiles.includes(file))
		.map((file) => ({ file, source: readFileSync(file, 'utf8') }));
