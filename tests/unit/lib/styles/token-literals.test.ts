import { describe, expect, it } from 'vitest';

import {
	findColorLiterals,
	findSourceColorLiterals,
	listColorScannedFiles,
	TOKEN_SOURCE,
} from './support/token-literals';

describe('color literals outside the tokens', () => {
	it('detects hexadecimal values and color functions', () => {
		const source = 'color: #fff; border: 1px solid #017FC0; background: rgb(0 0 0); fill: rgba(0,0,0,.1);';

		const literals = findColorLiterals('example.css', `${source} hsl(0 0% 0%); oklch(0.5 0.1 200);`);

		expect(literals.map((literal) => literal.excerpt)).toEqual([
			'#fff',
			'#017FC0',
			'rgb(',
			'rgba(',
			'hsl(',
			'oklch(',
		]);
	});

	it('detects arbitrary Tailwind color values', () => {
		const literals = findColorLiterals('Example.svelte', '<p class="bg-[#ffb70f] text-[rgb(1,2,3)]"></p>');

		expect(literals.map((literal) => literal.excerpt)).toEqual(['#ffb70f', 'rgb(']);
	});

	it('ignores Svelte blocks, HTML entities and subpath imports', () => {
		const source = "{#each items as item}{/each}{#await promise}{/await}&#8203;import x from '#lib/a.js';";

		const literals = findColorLiterals('Example.svelte', source);

		expect(literals).toEqual([]);
	});

	it('scans markup, styles and component modules but not the token file', () => {
		const files = listColorScannedFiles('src');

		expect(files).toContain('src/routes/+page.svelte');
		expect(files).toContain('src/app.css');
		expect(files).toContain('src/lib/components/forms/control-classes.ts');
		expect(files).not.toContain(TOKEN_SOURCE);
	});

	it('keeps color values only in the theme tokens', () => {
		const literals = findSourceColorLiterals('src');

		expect(literals).toEqual([]);
	});
});
