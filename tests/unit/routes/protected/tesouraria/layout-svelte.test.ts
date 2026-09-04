import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';

const pageState = vi.hoisted(() => ({ url: new URL('http://localhost/tesouraria') }));
vi.mock('$app/state', () => ({ page: pageState }));

import Layout from '../../../../../src/routes/(protected)/tesouraria/+layout.svelte';
import { parseRenderedBody } from '../../../support/rendered-document';

describe('tesouraria layout', () => {
	it('shows unified navigation and hides audit navigation for regular users', () => {
		pageState.url = new URL('http://localhost/tesouraria/lancamentos');
		const { body } = render(Layout, { props: { data: { username: 'Tesouraria', userid: 'u', isAdmin: false } } });
		const document = parseRenderedBody(body);

		expect(document.querySelector('a[title="Lançamentos"]')?.getAttribute('href')).toContain(
			'/tesouraria/lancamentos',
		);
		expect(document.querySelector('li.sidebar-item.active a[href*="/tesouraria/lancamentos"]')).not.toBeNull();
		expect(document.querySelector('a[title="Estornos"]')).toBeNull();
		expect(document.querySelector('a[title="Entradas"]')).toBeNull();
		expect(document.querySelector('a[title="Histórico"]')).toBeNull();
	});

	it('shows audit navigation for administrators', () => {
		pageState.url = new URL('http://localhost/tesouraria/estornos');
		const { body } = render(Layout, { props: { data: { username: 'Admin', userid: 'a', isAdmin: true } } });
		const document = parseRenderedBody(body);

		expect(document.querySelector('a[title="Estornos"]')).not.toBeNull();
		expect(document.querySelector('li.sidebar-item.active a[title="Estornos"]')).not.toBeNull();
		expect(document.querySelector('a[title="Despesas"]')).toBeNull();
		expect(document.querySelector('a[title="Histórico"]')).toBeNull();
	});
});
