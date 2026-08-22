import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

const affectedAdapters = [
	'src/routes/(protected)/biblioteca/+page.server.ts',
	'src/routes/(protected)/biblioteca/avisos/+page.server.ts',
	'src/routes/(protected)/biblioteca/avisos/[id=integer]/+page.server.ts',
];
const affectedPages = [
	'src/routes/(protected)/biblioteca/+page.svelte',
	'src/routes/(protected)/biblioteca/avisos/+page.svelte',
	'src/routes/(protected)/biblioteca/avisos/[id=integer]/+page.svelte',
];
const readSource = (path: string) => readFile(path, 'utf8');
const getEachBlocks = (source: string) => source.match(/\{#each[^}]+\}/g) || [];

describe('notice boundaries', () => {
	it('keeps Drizzle notice queries in the dedicated model', async () => {
		const sources = await Promise.all(affectedAdapters.map(readSource));

		sources.forEach((source) => {
			expect(source).not.toContain('from(aviso)');
			expect(source).not.toContain('insert(aviso)');
			expect(source).not.toContain('update(aviso)');
		});
	});

	it('uses current Svelte syntax and keyed lists on affected pages', async () => {
		const sources = await Promise.all(affectedPages.map(readSource));

		sources.forEach((source) => {
			expect(source).not.toMatch(/\buse:/);
			expect(source).not.toMatch(/\bclass:/);
			expect(source).not.toMatch(/export let/);
			getEachBlocks(source).forEach((block) => expect(block).toMatch(/\([^)]*\)/));
		});
	});
});
