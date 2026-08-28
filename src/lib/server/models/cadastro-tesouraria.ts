import { cadastros } from '$lib/server/database/schema';
import { eq } from 'drizzle-orm';

import type { CadastroDatabase } from './cadastro-database';
import { withCadastroErrorTranslation } from './cadastro-error';
import type { TesourariaCreateData, TesourariaUpdateData } from './cadastro-inputs';
import { cadastroIdFields } from './cadastro-projections';
import { toTesourariaValues } from './cadastro-values';

export const createTesouraria = (database: CadastroDatabase, input: TesourariaCreateData, userCadastro: string) =>
	withCadastroErrorTranslation(() =>
		database
			.insert(cadastros)
			.values({ ...toTesourariaValues(input), userCadastro })
			.returning(cadastroIdFields),
	);

export const updateTesouraria = (
	database: CadastroDatabase,
	id: number,
	input: TesourariaUpdateData,
	userAlteracao: string,
) =>
	withCadastroErrorTranslation(async () => {
		const [updated] = await database
			.update(cadastros)
			.set({ ...toTesourariaValues(input), userAlteracao, dataAlteracao: new Date() })
			.where(eq(cadastros.idleitor, id))
			.returning(cadastroIdFields);

		return updated !== undefined;
	});
