import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/database/connection';
import { editora, keyword } from '$lib/server/database/schema';
import { bibliotecaUser } from '../../../support/auth';
import { createRequestEvent, invoke } from '../../../support/request-event';
import {
	actions as publisherActions,
	load as publisherLoad,
} from '../../../../../src/routes/(protected)/biblioteca/editoras/[id=integer]/+page.server';
import {
	actions as keywordActions,
	load as keywordLoad,
} from '../../../../../src/routes/(protected)/biblioteca/keywords/[id=integer]/+page.server';

const event = (field: string, value: string, id: number) => {
	const form = new FormData();
	form.set(field, value);

	return createRequestEvent({
		locals: { user: bibliotecaUser, session: null },
		params: { id: `${id}` },
		request: new Request('http://localhost/', { method: 'POST', body: form }),
	});
};

describe('TI-07 biblioteca publisher and keyword edits', () => {
	it('loads, validates, updates, and rejects missing catalog records', async () => {
		const scenarios = [
			{
				load: publisherLoad,
				action: publisherActions.default,
				field: 'nome' as const,
				table: editora,
				column: editora.ideditora,
			},
			{
				load: keywordLoad,
				action: keywordActions.default,
				field: 'chave' as const,
				table: keyword,
				column: keyword.idkeyword,
			},
		];

		for (const scenario of scenarios) {
			const fieldValue = `Integração ${scenario.field}`;
			const [created] = await db
				.insert(scenario.table)
				.values({ [scenario.field]: fieldValue })
				.returning({ id: scenario.column });
			if (!created) throw new Error('Registro de catálogo não criado.');

			try {
				const loaded = await invoke(
					scenario.load,
					createRequestEvent({
						locals: { user: bibliotecaUser, session: null },
						params: { id: `${created.id}` },
					}),
				);
				const invalid = await invoke(scenario.action, event(scenario.field, '', created.id));
				const updated = await invoke(
					scenario.action,
					event(scenario.field, `${fieldValue} atualizado`, created.id),
				);

				expect(loaded).toBeDefined();
				expect(invalid).toMatchObject({ status: 400 });
				expect(updated).toEqual({ status: 200 });
				await expect(
					invoke(
						scenario.load,
						createRequestEvent({ locals: { user: bibliotecaUser, session: null }, params: { id: '-1' } }),
					),
				).rejects.toMatchObject({ status: 404 });
				await expect(
					invoke(scenario.action, event(scenario.field, `${fieldValue} ausente`, -1)),
				).rejects.toMatchObject({
					status: 404,
				});
			} finally {
				await db.delete(scenario.table).where(eq(scenario.column, created.id));
			}
		}
	});
});
