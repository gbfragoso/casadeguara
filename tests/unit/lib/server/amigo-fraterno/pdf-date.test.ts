import { describe, expect, it } from 'vitest';

import { parseAmigoFraternoPdfRequest } from '$lib/validation/amigo-fraterno/pdf';
import { formatNextDrawDate } from '$lib/server/amigo-fraterno/pdf-date';

describe('Amigo Fraterno PDF date', () => {
	it('validates and formats a calendar date without a timezone', () => {
		const result = parseAmigoFraternoPdfRequest(new URLSearchParams('nextDrawDate=2026-11-22'));

		expect(result.success).toBe(true);
		if (result.success) expect(formatNextDrawDate(result.data)).toBe('22/11/2026');
	});

	it.each([
		'',
		'2026-02-29',
		'2026-13-01',
		'2026-11-22&extra=value',
		'nextDrawDate=2026-11-22&nextDrawDate=2026-11-23',
	])('rejects the invalid query %s', (query) => {
		expect(parseAmigoFraternoPdfRequest(new URLSearchParams(query)).success).toBe(false);
	});
});
