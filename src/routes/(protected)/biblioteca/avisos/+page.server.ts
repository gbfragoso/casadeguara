import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';
import { avisoModel, type AvisoModel } from '$lib/server/models/aviso';
import { avisoSchema } from '$lib/validation/aviso';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import type { Actions, PageServerLoad } from './$types';

type NoticeModel = Pick<AvisoModel, 'create' | 'listRecent'>;
type User = { roles: string; username: string } | null;
type ActionContext = { locals: { user: User }; request: Request };

const getSubmittedText = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

const logFailure = (message: string, cause: unknown) => console.error(message, { cause });

export const createAvisosPageHandlers = (model: NoticeModel) => ({
	load: async ({ locals }: Pick<ActionContext, 'locals'>) => {
		requireLibraryAccess(locals.user);

		try {
			return { avisos: await model.listRecent() };
		} catch (cause) {
			logFailure('Falha ao carregar a lista de avisos', cause);
			error(500, { message: 'Falha ao carregar a lista de avisos' });
		}
	},
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			const user = requireLibraryAccess(locals.user);
			const formData = await request.formData();
			const rawText = formData.get('texto');
			const result = avisoSchema.safeParse({ texto: rawText });
			const values = { texto: getSubmittedText(rawText) };

			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

			try {
				await model.create(result.data.texto, user.username);
				return { status: 201 };
			} catch (cause) {
				logFailure('Falha ao criar um novo aviso', cause);
				error(500, { message: 'Falha ao criar um novo aviso' });
			}
		},
	},
});

const handlers = createAvisosPageHandlers(avisoModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
