import { describe, expect, it } from 'vitest';

describe('suíte de integração', () => {
	it('executa uma asserção assíncrona determinística', async () => {
		const valorEsperado = 'pronta';

		const valorRecebido = await Promise.resolve(valorEsperado);

		expect(valorRecebido).toBe(valorEsperado);
	});
});
