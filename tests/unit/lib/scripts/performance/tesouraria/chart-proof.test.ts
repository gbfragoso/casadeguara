import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ChartProof from '../../../../../e2e/chart-proof/ChartProof.svelte';

describe('prova Chart.js', () => {
	it('renderiza no SSR sem acessar o canvas', () => {
		const result = render(ChartProof);

		expect(result.body).toContain('Evolução financeira');
		expect(result.body).toContain('Prova de compatibilidade');
	});
});
