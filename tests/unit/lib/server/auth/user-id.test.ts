import { describe, expect, it } from 'vitest';

import { generateUserId } from '#lib/server/auth/user-id.js';
import { params } from '../../../../../src/params';

const USER_ID_PATTERN = /^[a-z2-7]{16}$/;
const SAMPLE_SIZE = 100;

describe('generateUserId', () => {
	it('generates an id accepted by the alphanumeric route matcher', () => {
		const id = generateUserId();

		expect(id).toMatch(USER_ID_PATTERN);
		expect(params.alphanumeric['~standard'].validate(id)).toEqual({ value: id });
	});

	it('generates a different id on each call', () => {
		const ids = new Set(Array.from({ length: SAMPLE_SIZE }, generateUserId));

		expect(ids.size).toBe(SAMPLE_SIZE);
	});
});
