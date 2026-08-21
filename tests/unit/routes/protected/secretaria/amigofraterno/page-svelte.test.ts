import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/amigofraterno/+page.svelte';

describe('amigo fraterno page', () => {
	it('renders totals, photo pending status, and the Cadastro guidance', () => {
		const { body } = render(Page, {
			props: {
				data: {
					username: 'Secretaria',
					userid: 'secretaria',
					isAdmin: false,
					total: 1,
					withoutPhoto: 1,
					participants: [{ id: 4, name: 'MARIA', hasPhoto: false }],
				},
			},
		});

		expect(body).toContain('Total: 1');
		expect(body).toContain('Sem foto: 1');
		expect(body).toContain('MARIA');
		expect(body).toContain('Pendente');
		expect(body).toContain('Cadastros');
		expect(body).toContain('Baixar cartões em PDF');
	});

	it('renders a textual empty state', () => {
		const { body } = render(Page, {
			props: {
				data: {
					username: 'Secretaria',
					userid: 'secretaria',
					isAdmin: false,
					total: 0,
					withoutPhoto: 0,
					participants: [],
				},
			},
		});

		expect(body).toContain('Não há participantes elegíveis no momento.');
		expect(body).not.toContain('Baixar cartões em PDF');
	});
});
