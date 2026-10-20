// @vitest-environment happy-dom
import { createRawSnippet, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import RootLayout from '../../../src/routes/+layout.svelte';

const MOUNTED_LAYOUTS: ReturnType<typeof mount>[] = [];

afterEach(() => {
	MOUNTED_LAYOUTS.splice(0).forEach((mounted) => unmount(mounted));
	document.body.replaceChildren();
});

describe('root layout', () => {
	it('renders the page content', () => {
		const target = document.createElement('div');
		document.body.append(target);
		const children = createRawSnippet(() => ({ render: () => '<main>Conteúdo da página</main>' }));

		MOUNTED_LAYOUTS.push(mount(RootLayout, { target, props: { children } }));

		expect(target.querySelector('main')?.textContent).toBe('Conteúdo da página');
	});
});
