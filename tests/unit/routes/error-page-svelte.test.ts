import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';

type ErrorPageState = { status: number; error: { message: string } | null };
const pageState = vi.hoisted((): ErrorPageState => ({ status: 404, error: { message: 'Página não encontrada' } }));
vi.mock('$app/state', () => ({ page: pageState }));

import ErrorPage from '../../../src/routes/+error.svelte';
import { parseRenderedBody } from '../support/rendered-document';

describe('error page', () => {
	it('renders the not-found fallback from the current page state', () => {
		pageState.status = 404;
		pageState.error = { message: 'Página não encontrada' };
		const { body } = render(ErrorPage);
		const document = parseRenderedBody(body);

		expect(document.querySelector('p')?.textContent).toBe('404');
		expect(document.body.textContent).toContain('Página não encontrada');
	});

	it('renders the server error message for non-404 responses', () => {
		pageState.status = 500;
		pageState.error = { message: 'Falha interna' };
		const { body } = render(ErrorPage);
		const document = parseRenderedBody(body);

		expect(document.querySelector('p')?.textContent).toBe('500');
		expect(document.body.textContent).toContain('Falha interna');
	});

	it('falls back to the not-found message when the error has no details', () => {
		pageState.status = 404;
		pageState.error = null;
		const document = parseRenderedBody(render(ErrorPage).body);

		expect(document.querySelector('main p + div')?.textContent?.trim()).toBe('Página não encontrada');
	});
});
