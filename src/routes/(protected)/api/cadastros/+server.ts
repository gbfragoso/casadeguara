import { hasSecretariaAccess } from '$lib/server/authorization/cadastros';
import { cadastroModel, type CadastroModel } from '$lib/server/models/cadastro';
import { secretariaFlagsSchema } from '$lib/validation/cadastros/flags';
import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

type FlagModel = Pick<CadastroModel, 'updateSecretariaFlag'>;
type User = { id: string; roles: string } | null;
type RequestContext = { locals: { user: User }; request: Request };

const INVALID_UPDATE_MESSAGE = 'Cadastro ou campo de atualização inválido.';
const FORBIDDEN_MESSAGE = 'Usuário não possui acesso ao sistema da secretaria.';

const getRequestBody = async (request: Request): Promise<unknown> => {
	try {
		return await request.json();
	} catch {
		return undefined;
	}
};

export const _createCadastroFlagHandler =
	(model: FlagModel) =>
	async ({ locals, request }: RequestContext) => {
		const user = locals.user;
		if (!user || !hasSecretariaAccess(user)) return json({ message: FORBIDDEN_MESSAGE }, { status: 401 });

		const result = secretariaFlagsSchema.safeParse(await getRequestBody(request));
		if (!result.success) {
			return json(
				{ message: INVALID_UPDATE_MESSAGE, errors: result.error.flatten().fieldErrors },
				{ status: 400 },
			);
		}

		try {
			const { id, field, value } = result.data;
			const updated = await model.updateSecretariaFlag(id, { field, value }, user.id);
			if (!updated) return json({ message: 'Cadastro não encontrado.' }, { status: 404 });

			return json({ message: 'Cadastro atualizado com sucesso.' });
		} catch {
			console.error('Falha ao atualizar um campo do cadastro.');
			return json({ message: 'Falha ao atualizar o cadastro.' }, { status: 500 });
		}
	};

export const POST: RequestHandler = _createCadastroFlagHandler(cadastroModel);
