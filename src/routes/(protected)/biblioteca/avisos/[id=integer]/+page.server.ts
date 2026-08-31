import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';
import { avisoModel, type AvisoModel } from '$lib/server/models/aviso';
import { avisoSchema } from '$lib/validation/aviso';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import type { Actions, PageServerLoad } from './$types';

type NoticeModel = Pick<AvisoModel, 'get' | 'update'>;
type User = { roles: string; username: string } | null;
type HandlerContext = { locals: { user: User }; params: { id: string } };
type ActionContext = HandlerContext & { request: Request };

const getSubmittedText = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

const logFailure = (message: string, cause: unknown) => console.error(message, { cause });

const createInternalAvisoEditHandlers = (model: NoticeModel) => ({
	load: async ({ locals, params }: HandlerContext) => {
		requireLibraryAccess(locals.user);
		const id = Number(params.id);
		let aviso;

		try {
			aviso = await model.get(id);
		} catch (cause) {
			logFailure('Falha ao baixar os dados do aviso', cause);
			error(500, { message: 'Falha ao baixar os dados do aviso' });
		}

		if (!aviso) error(404, { message: 'Aviso não encontrado' });

		return { aviso };
	},
	actions: {
		default: async ({ locals, params, request }: ActionContext) => {
			requireLibraryAccess(locals.user);
			const formData = await request.formData();
			const rawText = formData.get('texto');
			const result = avisoSchema.safeParse({ texto: rawText });
			const values = { texto: getSubmittedText(rawText) };

			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

			let updated;
			try {
				updated = await model.update(Number(params.id), result.data.texto);
			} catch (cause) {
				logFailure('Falha ao atualizar o texto do aviso', cause);
				error(500, { message: 'Falha ao atualizar o texto do aviso' });
			}

			if (!updated) error(404, { message: 'Aviso não encontrado' });

			return { status: 200 };
		},
	},
});

const handlers = createInternalAvisoEditHandlers(avisoModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
