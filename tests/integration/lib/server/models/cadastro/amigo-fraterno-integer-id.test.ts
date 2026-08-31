import { describe, expect, it } from 'vitest';

import { cadastroFotos, cadastros, emprestimo } from '$lib/server/database/schema';
import { eq, sql } from 'drizzle-orm';

import { withProvisionedDatabase } from '../../database/migration-test-support';
import { createTestName } from './test-support';

const PREVIOUS_ID_LIMIT = 32767;

describe('Cadastro integer identifiers', () => {
	it('stores photo and loan references above the previous limit', async () => {
		await withProvisionedDatabase(async (database) => {
			await database.execute(
				sql`SELECT setval(pg_get_serial_sequence('cadastros', 'idleitor'), ${PREVIOUS_ID_LIMIT}, true)`,
			);
			const [created] = await database
				.insert(cadastros)
				.values({ nome: createTestName('integer-id-photo') })
				.returning({ idleitor: cadastros.idleitor });
			if (!created) throw new Error('Cadastro de teste não foi criado.');

			await database
				.insert(cadastroFotos)
				.values({ cadastroId: created.idleitor, original: Uint8Array.of(1), cartao: Uint8Array.of(2) });
			await database.insert(emprestimo).values({ leitor: created.idleitor, exemplar: 1 });
			const [photo] = await database
				.select()
				.from(cadastroFotos)
				.where(eq(cadastroFotos.cadastroId, created.idleitor));
			const [loan] = await database.select().from(emprestimo).where(eq(emprestimo.leitor, created.idleitor));
			expect(created.idleitor).toBeGreaterThan(PREVIOUS_ID_LIMIT);
			expect(photo?.cadastroId).toBe(created.idleitor);
			expect(loan?.leitor).toBe(created.idleitor);
			await database.delete(cadastros).where(eq(cadastros.idleitor, created.idleitor));
			const [remainingPhoto] = await database
				.select()
				.from(cadastroFotos)
				.where(eq(cadastroFotos.cadastroId, created.idleitor));
			expect(remainingPhoto).toBeUndefined();
		});
	});
});
