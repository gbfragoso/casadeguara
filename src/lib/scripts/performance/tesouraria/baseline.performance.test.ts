import { describe, expect, it } from 'vitest';

import { measureTreasuryBundle } from './bundle';
import { writeBundleBaseline } from './report';

describe('baseline do cliente da tesouraria', () => {
	it('mede o fechamento transitivo da rota sem depender de nomes hash', async () => {
		const bundle = await measureTreasuryBundle();

		expect(bundle.route).toBe('/(protected)/tesouraria');
		expect(bundle.files.length).toBeGreaterThan(0);
		expect(bundle.gzipBytes).toBeGreaterThan(0);
		await writeBundleBaseline(bundle);
	});
});
