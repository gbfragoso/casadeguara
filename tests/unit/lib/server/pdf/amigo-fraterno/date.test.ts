import { describe, expect, it } from 'vitest';

import { parseAmigoFraternoPdfRequest } from '$lib/validation/pdf/amigo-fraterno';
import { formatNextDrawDate } from '$lib/server/pdf/amigo-fraterno/date';

describe('Amigo Fraterno PDF date', () => {
	it('validates and formats a calendar date without a timezone', () => {
		const result = parseAmigoFraternoPdfRequest(new URLSearchParams('nextDrawDate=2026-11-22'));

		expect(result.success).toBe(true);
		if (result.success) expect(formatNextDrawDate(result.data)).toBe('22/11/2026');
	});

	it('accepts February 29 in a leap year', () => {
		const result = parseAmigoFraternoPdfRequest(new URLSearchParams('nextDrawDate=2024-02-29'));

		expect(result.success).toBe(true);
	});

	it.each([
		'',
		'2026-02-29',
		'2026-13-01',
		'other=value',
		'2026-11-22&extra=value',
		'nextDrawDate=2026-11-22&nextDrawDate=2026-11-23',
	])('rejects the invalid query %s', (query) => {
		expect(parseAmigoFraternoPdfRequest(new URLSearchParams(query)).success).toBe(false);
	});
});
