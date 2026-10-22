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

	it('explains an unexpected failure in Portuguese and offers a retry', () => {
		pageState.status = 500;
		pageState.error = { message: 'Internal Error' };
		const document = parseRenderedBody(render(ErrorPage).body);

		const actions = [...document.querySelectorAll('main a, main button')].map((action) =>
			action.textContent?.trim(),
		);

		expect(document.body.textContent).toContain('Ocorreu um erro inesperado. Tente novamente em instantes.');
		expect(document.body.textContent).not.toContain('Internal Error');
		expect(actions).toEqual(['Tentar novamente', 'Ir para a página inicial']);
	});

	it('offers only the way back to the home page for a missing page', () => {
		pageState.status = 404;
		pageState.error = { message: 'Livro não encontrado.' };
		const document = parseRenderedBody(render(ErrorPage).body);

		const actions = [...document.querySelectorAll('main a, main button')];

		expect(actions.map((action) => [action.textContent?.trim(), action.getAttribute('href')])).toEqual([
			['Ir para a página inicial', '/sistemas'],
		]);
	});

	it('falls back to the not-found message when the error has no details', () => {
		pageState.status = 404;
		pageState.error = null;
		const document = parseRenderedBody(render(ErrorPage).body);

		expect(document.querySelector('main p + div')?.textContent?.trim()).toBe('Página não encontrada');
	});
});
