import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import SiteFooter from '#lib/components/site/SiteFooter.svelte';
import { parseRenderedBody } from '../../../support/rendered-document';

describe('SiteFooter address', () => {
	it('gives the address of the Casa with its postal code', () => {
		const { body } = render(SiteFooter);

		const address = parseRenderedBody(body).querySelector('footer p:nth-of-type(2)')?.textContent;

		expect(address).toBe('Rua Major Dórea, 86, Castália, Itabuna-BACEP 45603-184');
	});
});
