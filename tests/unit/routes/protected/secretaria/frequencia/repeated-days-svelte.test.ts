// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/forms', () => ({ enhance: () => undefined }));

import ListPage from '../../../../../../src/routes/(protected)/secretaria/frequencia/+page.svelte';
import RegistrationPage from '../../../../../../src/routes/(protected)/secretaria/frequencia/registro/+page.svelte';
import { renderComponent } from '../../../../lib/components/support/render-component.js';

const readHeadings = (target: HTMLElement) =>
	[...target.querySelectorAll('thead th')].map((heading) => heading.textContent?.trim());

describe('attendance period repeating a day of the month', () => {
	it('renders every date column of the printable list', async () => {
		const target = await renderComponent(ListPage, {
			form: {
				leitores: [{ nome: 'Maria', desencarnado: false }],
				datas: ['15', '22', '15'],
				fulldates: ['2026-04-15', '2026-04-22', '2026-05-15'],
			},
		});

		expect(readHeadings(target)).toEqual(['15', '22', '15', 'Nome']);
	});

	it('renders every date column of the registration list', async () => {
		const target = await renderComponent(RegistrationPage, {
			form: {
				leitores: [{ id: 7, nome: 'Maria' }],
				datas: ['15', '15'],
				fulldates: ['2026-04-15', '2026-05-15'],
			},
		});

		expect(readHeadings(target)).toEqual(['15', '15', 'Nome']);
	});
});
