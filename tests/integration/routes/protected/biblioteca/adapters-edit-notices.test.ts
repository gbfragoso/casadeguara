import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/database/connection';
import { aviso } from '$lib/server/database/schema';
import { bibliotecaUser } from '../../../support/auth';
import { createRequestEvent, invoke } from '../../../support/request-event';
import {
	actions as noticeActions,
	load as noticeLoad,
} from '../../../../../src/routes/(protected)/biblioteca/avisos/[id=integer]/+page.server';

const event = (field: string, value: string, id: number) => {
	const form = new FormData();
	form.set(field, value);

	return createRequestEvent({
		locals: { user: bibliotecaUser, session: null },
		params: { id: `${id}` },
		request: new Request('http://localhost/', { method: 'POST', body: form }),
	});
};

describe('TI-07 biblioteca notice edits', () => {
	it('updates a notice through the real export and rejects an absent notice', async () => {
		const [created] = await db
			.insert(aviso)
			.values({ texto: 'Integração aviso edit', username: bibliotecaUser.username })
			.returning({ id: aviso.idaviso });
		if (!created) throw new Error('Aviso de teste não criado.');

		try {
			const loaded = await invoke(
				noticeLoad,
				createRequestEvent({
					locals: { user: bibliotecaUser, session: null },
					params: { id: `${created.id}` },
				}),
			);
			const invalid = await invoke(noticeActions.default, event('texto', '', created.id));
			const updated = await invoke(
				noticeActions.default,
				event('texto', 'Integração aviso atualizado', created.id),
			);

			expect(loaded).toBeDefined();
			expect(invalid).toMatchObject({ status: 400 });
			expect(updated).toEqual({ status: 200 });
			await expect(
				invoke(
					noticeLoad,
					createRequestEvent({ locals: { user: bibliotecaUser, session: null }, params: { id: '-1' } }),
				),
			).rejects.toMatchObject({ status: 404 });
			await expect(invoke(noticeActions.default, event('texto', 'Aviso ausente', -1))).rejects.toMatchObject({
				status: 404,
			});
		} finally {
			await db.delete(aviso).where(eq(aviso.idaviso, created.id));
		}
	});
});
