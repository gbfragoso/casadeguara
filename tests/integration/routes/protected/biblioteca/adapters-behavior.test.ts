import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/database/connection';
import { aviso } from '$lib/server/database/schema';
import { actions as noticeActions } from '../../../../../src/routes/(protected)/biblioteca/avisos/+page.server';
import { load as libraryDashboardLoad } from '../../../../../src/routes/(protected)/biblioteca/+page.server';
import { bibliotecaUser } from '../../../support/auth';
import { createRequestEvent, invoke } from '../../../support/request-event';

const createFormRequest = (form: FormData) => new Request('http://localhost/', { method: 'POST', body: form });

describe('TI-07 biblioteca route exports', () => {
	it('loads the real dashboard export for an authorized library user', async () => {
		const result = await invoke(
			libraryDashboardLoad,
			createRequestEvent({ locals: { user: bibliotecaUser, session: null } }),
		);

		expect(result).toEqual(expect.objectContaining({ username: bibliotecaUser.name, userid: bibliotecaUser.id }));
	});

	it('returns a validation failure through the real notice action', async () => {
		const form = new FormData();
		const result = await invoke(
			noticeActions.default,
			createRequestEvent({ locals: { user: bibliotecaUser, session: null }, request: createFormRequest(form) }),
		);

		expect(result).toMatchObject({ status: 400 });
	});

	it('commits a valid notice through the real action export', async () => {
		const text = 'Integração aviso route';
		const form = new FormData();
		form.set('texto', text);
		const result = await invoke(
			noticeActions.default,
			createRequestEvent({ locals: { user: bibliotecaUser, session: null }, request: createFormRequest(form) }),
		);
		const [created] = await db.select({ id: aviso.idaviso }).from(aviso).where(eq(aviso.texto, text));

		try {
			expect(result).toEqual({ status: 201 });
			expect(created).toBeDefined();
		} finally {
			if (created) await db.delete(aviso).where(eq(aviso.idaviso, created.id));
		}
	});
});
