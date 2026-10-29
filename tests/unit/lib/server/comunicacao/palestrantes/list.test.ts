import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSpeakerListLoad } from '#lib/server/comunicacao/palestrantes/list.js';
import { expectHttpError, expectRedirect, runHandler } from '../../../../support/handler-event';
import { createFakeSpeakers, VOLUNTEER } from './speaker-fakes';

const LIST_URL = 'http://localhost/comunicacao/palestrantes';

describe('speaker list load', () => {
	afterEach(() => vi.restoreAllMocks());

	it('TU-17 passes the normalized search term to the model', async () => {
		const speakers = createFakeSpeakers();

		const { result } = await runHandler(createSpeakerListLoad({ speakers }), {
			roles: VOLUNTEER,
			url: `${LIST_URL}?nome=%20AMORIM%20`,
		});

		expect(speakers.list).toHaveBeenCalledWith('amorim');
		expect(result).toEqual({ busca: ' AMORIM ', palestrantes: [] });
	});

	it('lists every speaker without a search', async () => {
		const speakers = createFakeSpeakers();

		await runHandler(createSpeakerListLoad({ speakers }), { roles: VOLUNTEER, url: LIST_URL });

		expect(speakers.list).toHaveBeenCalledWith('');
	});

	it('rejects a search longer than a speaker name', async () => {
		const speakers = createFakeSpeakers();

		const { error } = await expectHttpError(createSpeakerListLoad({ speakers }), {
			roles: VOLUNTEER,
			url: `${LIST_URL}?nome=${'a'.repeat(61)}`,
		});

		expect(error.status).toBe(400);
		expect(speakers.list).not.toHaveBeenCalled();
	});

	it('denies a user without a Comunicação role', async () => {
		const speakers = createFakeSpeakers();

		const { error } = await expectHttpError(createSpeakerListLoad({ speakers }), {
			roles: 'secretaria',
			url: LIST_URL,
		});

		expect(error.status).toBe(403);
		expect(speakers.list).not.toHaveBeenCalled();
	});

	it('sends an anonymous visitor to the login page', async () => {
		const { redirect } = await expectRedirect(createSpeakerListLoad({ speakers: createFakeSpeakers() }));

		expect(redirect).toMatchObject({ status: 302, location: LOGIN_PATH });
	});

	it('reports a failure to read the speakers', async () => {
		const speakers = createFakeSpeakers();
		speakers.list.mockRejectedValue(new Error('database down'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const { error } = await expectHttpError(createSpeakerListLoad({ speakers }), {
			roles: VOLUNTEER,
			url: LIST_URL,
		});

		expect(error.status).toBe(500);
	});
});
