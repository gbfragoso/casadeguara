import { cadastros } from '$lib/database/schema';
import { eq } from 'drizzle-orm';

import type { CadastroDatabase } from './cadastro-database';
import { withCadastroErrorTranslation } from './cadastro-error';
import type { BibliotecaCreateData, BibliotecaUpdateData } from './cadastro-inputs';
import { cadastroIdFields } from './cadastro-projections';
import { toBibliotecaValues } from './cadastro-values';

export const createBiblioteca = (database: CadastroDatabase, input: BibliotecaCreateData, userCadastro: string) =>
	withCadastroErrorTranslation(() =>
		database
			.insert(cadastros)
			.values({ ...toBibliotecaValues(input), userCadastro })
			.returning(cadastroIdFields),
	);

export const updateBiblioteca = (
	database: CadastroDatabase,
	id: number,
	input: BibliotecaUpdateData,
	userAlteracao: string,
) =>
	withCadastroErrorTranslation(async () => {
		const [updated] = await database
			.update(cadastros)
			.set({ ...toBibliotecaValues(input), userAlteracao, dataAlteracao: new Date() })
			.where(eq(cadastros.idleitor, id))
			.returning(cadastroIdFields);

		return updated !== undefined;
	});
