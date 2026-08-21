import { describe, expect, it, vi } from 'vitest';

import { _createAmigoFraternoLoad } from '../../../../../../src/routes/(protected)/secretaria/amigofraterno/+page.server';
import { secretariaUser } from '../cadastros/test-support';

describe('amigo fraterno page load', () => {
	it('returns only page data and derives totals from the lightweight participant list', async () => {
		const participants = {
			listSummary: vi.fn().mockResolvedValue([
				{ id: 2, name: 'ANA', hasPhoto: true },
				{ id: 4, name: 'MARIA', hasPhoto: false },
			]),
		};

		await expect(_createAmigoFraternoLoad(participants)({ locals: { user: secretariaUser } })).resolves.toEqual({
			participants: [
				{ id: 2, name: 'ANA', hasPhoto: true },
				{ id: 4, name: 'MARIA', hasPhoto: false },
			],
			total: 2,
			withoutPhoto: 1,
		});
	});

	it('requires secretaria access before reading participants', async () => {
		const participants = { listSummary: vi.fn() };

		await expect(_createAmigoFraternoLoad(participants)({ locals: { user: null } })).rejects.toMatchObject(
			expect.objectContaining({ status: 302 }),
		);
		expect(participants.listSummary).not.toHaveBeenCalled();
	});
});
