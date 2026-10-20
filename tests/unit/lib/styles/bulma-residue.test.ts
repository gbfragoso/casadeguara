import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
	findBulmaImports,
	findForbiddenPackages,
	findSassStyleBlocks,
	isSassStylesheet,
	listFiles,
	readScannedSources,
} from './support/bulma-residue';

const SOURCE_ROOT = 'src';

describe('Bulma and preprocessor residue', () => {
	it('reports Bulma and Sass packages declared in the manifest', () => {
		const manifest = { dependencies: { bulma: '^1.0.4' }, devDependencies: { sass: '^1', 'sass-embedded': '^1' } };

		const forbidden = findForbiddenPackages(manifest);

		expect(forbidden).toEqual(['bulma', 'sass', 'sass-embedded']);
	});

	it('keeps Bulma and Sass packages out of package.json', () => {
		const manifest = JSON.parse(readFileSync('package.json', 'utf8'));

		const forbidden = findForbiddenPackages(manifest);

		expect(forbidden).toEqual([]);
	});

	it('keeps Sass stylesheets out of the source tree', () => {
		const files = listFiles(SOURCE_ROOT);

		const sassStylesheets = files.filter(isSassStylesheet);

		expect(files.length).toBeGreaterThan(0);
		expect(sassStylesheets).toEqual([]);
	});

	it('reports Sass style blocks in components', () => {
		const source = [
			'<style lang="scss">',
			'</style>',
			"<style lang='sass'>",
			'</style>',
			'<style>',
			'</style>',
		].join('\n');

		const violations = findSassStyleBlocks('Sample.svelte', source);

		expect(violations.map(({ line }) => line)).toEqual([1, 3]);
	});

	it('keeps Sass style blocks out of the source tree', () => {
		const sources = readScannedSources(listFiles(SOURCE_ROOT));

		const violations = sources.flatMap(({ file, source }) => findSassStyleBlocks(file, source));

		expect(violations).toEqual([]);
	});

	it('reports Bulma imports in stylesheets and modules', () => {
		const source = [
			"@use 'bulma/sass' with ($primary: #017fc0);",
			"@import url('bulma/css/bulma.min.css');",
			"import 'bulma/css/bulma.css';",
			"const bulma = await import('bulma');",
			"import tailwindcss from '@tailwindcss/vite';",
			'background: var(--bulma-scheme-main);',
		].join('\n');

		const violations = findBulmaImports('sample.ts', source);

		expect(violations.map(({ line }) => line)).toEqual([1, 2, 3, 4]);
	});

	it('keeps Bulma imports out of the source tree', () => {
		const sources = readScannedSources(listFiles(SOURCE_ROOT));

		const violations = sources.flatMap(({ file, source }) => findBulmaImports(file, source));

		expect(sources.length).toBeGreaterThan(0);
		expect(violations).toEqual([]);
	});
});
