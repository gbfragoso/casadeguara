import { cadastros } from '$lib/server/database/schema';
import { eq } from 'drizzle-orm';

import type { CadastroDatabase } from './cadastro-database';
import { withCadastroErrorTranslation } from './cadastro-error';
import type { SecretariaCreateData, SecretariaFlagData, SecretariaUpdateData } from './cadastro-inputs';
import { cadastroIdFields } from './cadastro-projections';
import { toSecretariaFlagValue, toSecretariaValues } from './cadastro-values';

export const createSecretaria = (database: CadastroDatabase, input: SecretariaCreateData, userCadastro: string) =>
	withCadastroErrorTranslation(() =>
		database
			.insert(cadastros)
			.values({ ...toSecretariaValues(input), userCadastro })
			.returning(cadastroIdFields),
	);

export const updateSecretaria = (
	database: CadastroDatabase,
	id: number,
	input: SecretariaUpdateData,
	userAlteracao: string,
) =>
	withCadastroErrorTranslation(async () => {
		const [updated] = await database
			.update(cadastros)
			.set({ ...toSecretariaValues(input), userAlteracao, dataAlteracao: new Date() })
			.where(eq(cadastros.idleitor, id))
			.returning(cadastroIdFields);

		return updated !== undefined;
	});

export const updateSecretariaFlag = async (
	database: CadastroDatabase,
	id: number,
	flag: SecretariaFlagData,
	userAlteracao: string,
) => {
	const [updated] = await database
		.update(cadastros)
		.set({ ...toSecretariaFlagValue(flag), userAlteracao, dataAlteracao: new Date() })
		.where(eq(cadastros.idleitor, id))
		.returning(cadastroIdFields);

	return updated !== undefined;
};
