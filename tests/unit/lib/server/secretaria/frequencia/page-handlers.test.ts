import { describe, expect, it } from 'vitest';

import { createSecretariaFrequenciaHandlers } from '#lib/server/secretaria/frequencia/page-handlers.js';
import { describeSecretariaAccess } from '../../../../support/secretaria-access-suite';

const handlers = createSecretariaFrequenciaHandlers();

describe('createSecretariaFrequenciaHandlers', () => {
	describeSecretariaAccess(handlers.load, {});

	it('offers no form action', () => {
		expect(Object.keys(handlers)).toEqual(['load']);
	});
});
