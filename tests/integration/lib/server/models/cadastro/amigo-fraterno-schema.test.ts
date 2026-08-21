import { describe, expect, it } from 'vitest';

import { db } from '$lib/database/connection';
import { cadastros } from '$lib/database/schema';
import { eq } from 'drizzle-orm';

import { createTestName, deleteCadastro, readCadastro } from './test-support';

describe('Cadastro Amigo Fraterno schema migration', () => {
	it('defaults participation to false and stores optional photo bytes', async () => {
		const [created] = await db
			.insert(cadastros)
			.values({ nome: createTestName('amigo-fraterno') })
			.returning({ idleitor: cadastros.idleitor });

		if (!created) throw new Error('Cadastro de teste não foi criado.');

		try {
			expect(await readCadastro(created.idleitor)).toMatchObject({ amigoFraterno: false, foto: null });

			const photo = Uint8Array.from([1, 2, 3]);
			await db.update(cadastros).set({ foto: photo }).where(eq(cadastros.idleitor, created.idleitor));

			const cadastro = await readCadastro(created.idleitor);
			expect(Array.from(cadastro?.foto ?? [])).toEqual(Array.from(photo));
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});
});
