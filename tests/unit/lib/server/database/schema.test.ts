import { describe, expect, it } from 'vitest';

import { palestras } from '#lib/server/database/schema.js';
import { DEFAULT_MEETING_ACTIVITIES } from '#lib/talks/defaults.js';

describe('palestras schema', () => {
	it('TU-06 keeps the schema default equal to the default meeting activities', () => {
		const schemaDefault = palestras.reuniaoCom.default;

		expect(schemaDefault).toEqual(DEFAULT_MEETING_ACTIVITIES);
	});
});
