import { describe, expect, it } from 'vitest';

import { db } from '$lib/server/database/connection';
import { cadastroFotos, cadastros } from '$lib/server/database/schema';
import { eq } from 'drizzle-orm';

import { createTestName, deleteCadastro, readCadastro } from './test-support';

describe('Cadastro Amigo Fraterno schema migration', () => {
	it('defaults participation to false and stores photo bytes in the dedicated table', async () => {
		const [created] = await db
			.insert(cadastros)
			.values({ nome: createTestName('amigo-fraterno') })
			.returning({ idleitor: cadastros.idleitor });

		if (!created) throw new Error('Cadastro de teste não foi criado.');

		try {
			expect(await readCadastro(created.idleitor)).toMatchObject({ amigoFraterno: false });

			const photo = Uint8Array.from([1, 2, 3]);
			await db.insert(cadastroFotos).values({ cadastroId: created.idleitor, original: photo, cartao: photo });

			const [stored] = await db
				.select({ original: cadastroFotos.original, cartao: cadastroFotos.cartao })
				.from(cadastroFotos)
				.where(eq(cadastroFotos.cadastroId, created.idleitor));
			expect(Array.from(stored?.original ?? [])).toEqual(Array.from(photo));
			expect(Array.from(stored?.cartao ?? [])).toEqual(Array.from(photo));
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});

	it('cascades photo removal when the cadastro is deleted', async () => {
		const [created] = await db
			.insert(cadastros)
			.values({ nome: createTestName('amigo-fraterno-cascade') })
			.returning({ idleitor: cadastros.idleitor });
		if (!created) throw new Error('Cadastro de teste não foi criado.');

		await db
			.insert(cadastroFotos)
			.values({ cadastroId: created.idleitor, original: Uint8Array.of(1), cartao: Uint8Array.of(2) });
		await deleteCadastro(created.idleitor);

		const photos = await db.select().from(cadastroFotos).where(eq(cadastroFotos.cadastroId, created.idleitor));
		expect(photos).toHaveLength(0);
	});

	it('enforces one photo per cadastro and rejects orphan rows', async () => {
		const [created] = await db
			.insert(cadastros)
			.values({ nome: createTestName('amigo-fraterno-constraints') })
			.returning({ idleitor: cadastros.idleitor });
		if (!created) throw new Error('Cadastro de teste não foi criado.');

		try {
			await db
				.insert(cadastroFotos)
				.values({ cadastroId: created.idleitor, original: Uint8Array.of(1), cartao: Uint8Array.of(2) });
			await expect(
				db
					.insert(cadastroFotos)
					.values({ cadastroId: created.idleitor, original: Uint8Array.of(3), cartao: Uint8Array.of(4) }),
			).rejects.toMatchObject({ cause: { code: '23505' } });
			await expect(
				db
					.insert(cadastroFotos)
					.values({ cadastroId: -1, original: Uint8Array.of(1), cartao: Uint8Array.of(2) }),
			).rejects.toMatchObject({ cause: { code: '23503' } });
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});
});
