import { describe, expect, it } from 'vitest';

import {
	DEFAULT_MEETING_ACTIVITIES,
	DEFAULT_TALK_LOCATION,
	hasDefaultLocationAndActivities,
} from '#lib/talks/defaults.js';

describe('hasDefaultLocationAndActivities', () => {
	it('accepts the default location and meeting activities', () => {
		const talk = { local: DEFAULT_TALK_LOCATION, reuniaoCom: [...DEFAULT_MEETING_ACTIVITIES] };

		const result = hasDefaultLocationAndActivities(talk);

		expect(result).toBe(true);
	});

	it.each([
		['a different location', { local: 'Auditório da praça', reuniaoCom: DEFAULT_MEETING_ACTIVITIES }],
		['an empty location', { local: null, reuniaoCom: DEFAULT_MEETING_ACTIVITIES }],
		['reordered activities', { local: DEFAULT_TALK_LOCATION, reuniaoCom: DEFAULT_MEETING_ACTIVITIES.toReversed() }],
		['fewer activities', { local: DEFAULT_TALK_LOCATION, reuniaoCom: DEFAULT_MEETING_ACTIVITIES.slice(1) }],
	])('rejects %s', (_case, talk) => {
		const result = hasDefaultLocationAndActivities(talk);

		expect(result).toBe(false);
	});
});
