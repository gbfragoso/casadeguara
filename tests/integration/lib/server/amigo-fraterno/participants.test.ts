import { describe, expect, it } from 'vitest';

import { db } from '$lib/database/connection';
import { cadastroFotos, cadastros } from '$lib/database/schema';
import { AmigoFraternoParticipants } from '$lib/server/amigo-fraterno/participants';

import { createTestName, deleteCadastro } from '../models/cadastro/test-support';

const participants = new AmigoFraternoParticipants(db);

describe('amigo fraterno participants', () => {
	it('selects only true, true, false eligibility combinations and excludes null values', async () => {
		const entries = await Promise.all(
			[
				{ amigoFraterno: true, trab: true, desencarnado: false },
				{ amigoFraterno: false, trab: true, desencarnado: false },
				{ amigoFraterno: true, trab: false, desencarnado: false },
				{ amigoFraterno: true, trab: true, desencarnado: true },
				{ amigoFraterno: true, trab: null, desencarnado: false },
				{ amigoFraterno: true, trab: true, desencarnado: null },
			].map(async (values, index) => {
				const [created] = await db
					.insert(cadastros)
					.values({ nome: createTestName(`eligibility-${index}`), ...values })
					.returning();
				if (!created) throw new Error('Cadastro de teste não foi criado.');
				return created;
			}),
		);

		try {
			const list = await participants.listSummary();

			expect(list.map(({ id }) => id)).toContain(entries[0].idleitor);
			expect(list.map(({ id }) => id)).not.toEqual(
				expect.arrayContaining(entries.slice(1).map(({ idleitor }) => idleitor)),
			);
		} finally {
			await Promise.all(entries.map(({ idleitor }) => deleteCadastro(idleitor)));
		}
	});

	it('returns sorted lightweight data with photo status and a private PDF projection', async () => {
		const namePrefix = createTestName('order-');
		const [ana, maria] = await Promise.all(
			['ÁNA', 'MARIA'].map(async (name, index) => {
				const [created] = await db
					.insert(cadastros)
					.values({
						nome: `${namePrefix}${name}`,
						amigoFraterno: true,
						trab: true,
						desencarnado: false,
					})
					.returning();
				if (!created) throw new Error('Cadastro de teste não foi criado.');
				if (index) {
					await db
						.insert(cadastroFotos)
						.values({ cadastroId: created.idleitor, original: Uint8Array.of(1), cartao: Uint8Array.of(1) });
				}
				return created;
			}),
		);

		try {
			const summary = await participants.listSummary();
			const selected = summary.filter(({ id }) => id === ana.idleitor || id === maria.idleitor);
			const pdf = await participants.listForPdf();

			expect(selected).toEqual([
				{ id: ana.idleitor, name: ana.nome, hasPhoto: false },
				{ id: maria.idleitor, name: maria.nome, hasPhoto: true },
			]);
			expect(selected.every((participant) => !('foto' in participant))).toBe(true);
			expect(pdf.find(({ id }) => id === maria.idleitor)?.photo).toEqual(Uint8Array.of(1));
		} finally {
			await Promise.all([deleteCadastro(ana.idleitor), deleteCadastro(maria.idleitor)]);
		}
	});
});
